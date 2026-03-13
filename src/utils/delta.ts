// Helpers for Quill Delta ↔ plain text / HTML conversion (FR-06)

import type { DeltaOp, QuillDelta } from "@/types/entry.types";

/**
 * Converts plain text from a TextInput into a minimal Quill Delta for API submission.
 * Appends a trailing newline as Quill convention requires.
 */
export function textToDelta(text: string): QuillDelta {
	return {
		ops: [{ insert: text.endsWith("\n") ? text : `${text}\n` }],
	};
}

/**
 * Extracts plain text from a Quill Delta by concatenating all string inserts.
 * Trims the trailing newline that Quill always appends.
 */
export function deltaToText(delta: QuillDelta): string {
	return delta.ops
		.map((op) => (typeof op.insert === "string" ? op.insert : ""))
		.join("")
		.replace(/\n$/, "");
}

// ─── HTML conversion utilities (FR-06: RichEditor ↔ Quill Delta) ─────────────

/**
 * Converts a Quill Delta to HTML for feeding into RichEditor's initialContentHTML.
 *
 * Quill Delta convention: block-level attributes (header, list, align) live on the
 * "\n" op that terminates each block, not on the text op. Inline attributes (bold,
 * italic) live on the text op itself.
 */
export function deltaToHtml(delta: QuillDelta): string {
	let html = "";
	let inlineBuffer = ""; // accumulates formatted inline HTML for the current block
	let listContext: "bullet" | "ordered" | null = null; // track open list tag

	const closeList = () => {
		if (listContext === "bullet") {
			html += "</ul>";
		} else if (listContext === "ordered") {
			html += "</ol>";
		}
		listContext = null;
	};

	const wrapInline = (text: string, attrs: Record<string, unknown>): string => {
		let result = text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
		if (attrs["bold"] === true) result = `<strong>${result}</strong>`;
		if (attrs["italic"] === true) result = `<em>${result}</em>`;
		return result;
	};

	for (const op of delta.ops) {
		if (typeof op.insert !== "string") continue;

		const attrs = op.attributes ?? {};
		const insert = op.insert;

		if (insert === "\n" || insert.endsWith("\n")) {
			// This op terminates a block — determine block type from attributes
			const header = attrs["header"] as number | undefined;
			const list = attrs["list"] as string | undefined;
			const align = attrs["align"] as string | undefined;

			// Text before the final \n (if any) is still inline content
			const textBefore = insert.endsWith("\n") ? insert.slice(0, -1) : "";
			if (textBefore) {
				inlineBuffer += wrapInline(textBefore, attrs);
			}

			if (header === 1) {
				closeList();
				html += `<h1>${inlineBuffer}</h1>`;
			} else if (header === 2) {
				closeList();
				html += `<h2>${inlineBuffer}</h2>`;
			} else if (list === "bullet") {
				if (listContext !== "bullet") {
					closeList();
					html += "<ul>";
					listContext = "bullet";
				}
				html += `<li>${inlineBuffer}</li>`;
			} else if (list === "ordered") {
				if (listContext !== "ordered") {
					closeList();
					html += "<ol>";
					listContext = "ordered";
				}
				html += `<li>${inlineBuffer}</li>`;
			} else if (align === "center") {
				closeList();
				html += `<p style="text-align:center">${inlineBuffer}</p>`;
			} else if (align === "right") {
				closeList();
				html += `<p style="text-align:right">${inlineBuffer}</p>`;
			} else {
				closeList();
				html += `<p>${inlineBuffer}</p>`;
			}

			inlineBuffer = "";
		} else {
			// Inline content — accumulate into buffer with formatting
			inlineBuffer += wrapInline(insert, attrs);
		}
	}

	// Flush any remaining inline buffer (e.g. Delta without trailing \n)
	if (inlineBuffer) {
		closeList();
		html += `<p>${inlineBuffer}</p>`;
	} else {
		closeList();
	}

	return html;
}

/**
 * Parses HTML produced by react-native-pell-rich-editor back into a Quill Delta.
 *
 * Handles the specific tag set that pell emits: <h1>, <h2>, <p>, <ul><li>,
 * <ol><li>, <strong>/<b>, <em>/<i>, inline style text-align.
 * Does NOT use a DOM — pure string/regex operations safe in React Native.
 */
export function htmlToDelta(html: string): QuillDelta {
	const ops: DeltaOp[] = [];

	// Decode common HTML entities in a text segment
	const decodeEntities = (text: string): string =>
		text
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&nbsp;/g, " ")
			.replace(/&quot;/g, '"');

	// Extract plain text and inline attributes from an inline HTML fragment.
	// Returns an array of DeltaOps for the inline segment.
	const parseInline = (fragment: string): DeltaOp[] => {
		const result: DeltaOp[] = [];
		// Regex matches: <strong>/<b>/<em>/<i> tags, or plain text between tags
		const tokenRe = /<(strong|b|em|i)>([\s\S]*?)<\/\1>|([^<]+)|<[^>]*>/gi;
		let match: RegExpExecArray | null;

		while ((match = tokenRe.exec(fragment)) !== null) {
			const tag = match[1]?.toLowerCase();
			const tagContent = match[2];
			const plainText = match[3];

			if (tag && tagContent !== undefined) {
				// Recurse to handle nested inline tags (e.g. <b><em>text</em></b>)
				const inner = parseInline(tagContent);
				for (const innerOp of inner) {
					const existing = innerOp.attributes ?? {};
					const newAttrs: Record<string, unknown> = { ...existing };
					if (tag === "strong" || tag === "b") newAttrs["bold"] = true;
					if (tag === "em" || tag === "i") newAttrs["italic"] = true;
					result.push({ insert: innerOp.insert, attributes: Object.keys(newAttrs).length ? newAttrs : undefined });
				}
			} else if (plainText) {
				const decoded = decodeEntities(plainText);
				if (decoded) result.push({ insert: decoded });
			}
			// Other tags (e.g. <br>, <span>) are skipped — their text content is
			// captured as plain text by the regex's fallback branch
		}

		return result;
	};

	// Add a block (inline ops + block terminator \n) to the ops array
	const addBlock = (
		inlineHtml: string,
		blockAttrs?: Record<string, unknown>,
	) => {
		const inlineOps = parseInline(inlineHtml);
		for (const op of inlineOps) {
			ops.push(op);
		}
		ops.push({ insert: "\n", attributes: blockAttrs });
	};

	// Match top-level block elements
	// Handles: <h1>, <h2>, <p> (with optional style), <ul>, <ol>
	const blockRe =
		/<(h1|h2|p|ul|ol)([^>]*)>([\s\S]*?)<\/\1>/gi;

	let blockMatch: RegExpExecArray | null;
	let lastIndex = 0;

	while ((blockMatch = blockRe.exec(html)) !== null) {
		lastIndex = blockRe.lastIndex;
		const tag = blockMatch[1].toLowerCase();
		const tagAttrs = blockMatch[2] ?? "";
		const inner = blockMatch[3] ?? "";

		if (tag === "h1") {
			addBlock(inner, { header: 1 });
		} else if (tag === "h2") {
			addBlock(inner, { header: 2 });
		} else if (tag === "ul") {
			// Extract <li> items from the list
			const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
			let liMatch: RegExpExecArray | null;
			while ((liMatch = liRe.exec(inner)) !== null) {
				addBlock(liMatch[1] ?? "", { list: "bullet" });
			}
		} else if (tag === "ol") {
			const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
			let liMatch: RegExpExecArray | null;
			while ((liMatch = liRe.exec(inner)) !== null) {
				addBlock(liMatch[1] ?? "", { list: "ordered" });
			}
		} else {
			// <p> — check for text-align style
			const alignMatch = /text-align\s*:\s*(center|right|left)/i.exec(tagAttrs);
			const align = alignMatch?.[1]?.toLowerCase();
			const blockAttrs =
				align && align !== "left" ? { align } : undefined;
			addBlock(inner, blockAttrs);
		}
	}

	// Handle any trailing text not wrapped in block tags (fallback)
	const remaining = html.slice(lastIndex).replace(/<[^>]*>/g, "").trim();
	if (remaining) {
		ops.push({ insert: decodeEntities(remaining) });
	}

	// Ensure trailing newline (Quill convention)
	if (ops.length === 0) {
		ops.push({ insert: "\n" });
	} else if (ops[ops.length - 1]?.insert !== "\n") {
		ops.push({ insert: "\n" });
	}

	return { ops };
}

/**
 * Strips all HTML tags and decodes entities to produce plain text.
 * Used for content length validation (min 10, max 5000 chars).
 */
export function htmlToText(html: string): string {
	return html
		.replace(/<[^>]*>/g, "")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&nbsp;/g, " ")
		.replace(/&quot;/g, '"')
		.trim();
}
