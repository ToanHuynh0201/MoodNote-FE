// FR-06: Rich text editor component wrapping react-native-pell-rich-editor

import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { vs } from "@/utils";
import { deltaToHtml, htmlToDelta } from "@/utils";
import type { QuillDelta } from "@/types/entry.types";

export interface RichTextEditorProps {
	/** Existing Delta content to display (detail/edit screen) */
	initialDelta?: QuillDelta;
	/** Called whenever content changes — receives the latest Delta */
	onChange: (delta: QuillDelta) => void;
	/** Called when the editor loses focus */
	onBlur?: () => void;
	/** Minimum height of the editor area in dp */
	minHeight?: number;
	placeholder?: string;
}

export interface RichTextEditorRef {
	/** Returns the current raw HTML from the editor — used for length validation in saveFn */
	getContentHtml: () => Promise<string>;
}

const TOOLBAR_ACTIONS = [
	actions.heading1,
	actions.heading2,
	actions.setBold,
	actions.setItalic,
	actions.insertBulletsList,
	actions.insertOrderedList,
];

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
	function RichTextEditor(
		{ initialDelta, onChange, onBlur, minHeight = vs(300), placeholder = "" },
		ref,
	) {
		const colors = useThemeColors();
		const styles = useMemo(() => createStyles(colors), [colors]);

		// Internal pell editor instance ref
		const editorRef = useRef<RichEditor>(null);

		// Track latest HTML locally so getContentHtml() can be synchronous
		const htmlRef = useRef<string>("");

		// Convert initialDelta to HTML exactly once on mount
		// (component only mounts after entry is loaded in [id].tsx, so initialDelta is stable)
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const initialContentHTML = useMemo(
			() => (initialDelta ? deltaToHtml(initialDelta) : ""),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[],
		);

		// Expose a ref API for the parent saveFn to call getContentHtml()
		useImperativeHandle(ref, () => ({
			getContentHtml: async () => htmlRef.current,
		}));

		const handleChange = useCallback(
			(html: string) => {
				htmlRef.current = html;
				onChange(htmlToDelta(html));
			},
			[onChange],
		);

		const editorStyle = useMemo(
			() => ({
				backgroundColor: colors.input.background,
				color: colors.input.text,
				caretColor: colors.brand.primary,
				placeholderColor: colors.input.placeholder,
				cssText: `
				* { font-family: -apple-system, Roboto, sans-serif; font-size: 15px; line-height: 1.6; }
				h1 { font-size: 22px; font-weight: 700; margin: 0 0 6px 0; }
				h2 { font-size: 18px; font-weight: 600; margin: 0 0 4px 0; }
				p { margin: 0 0 4px 0; }
				ul, ol { padding-left: 20px; margin: 0 0 4px 0; }
			`,
			}),
			[colors],
		);

		return (
			<View style={styles.container}>
				<RichToolbar
					// RichToolbar needs the ref to the RichEditor to communicate
					editor={editorRef as unknown as React.RefObject<RichEditor>}
					actions={TOOLBAR_ACTIONS}
					iconTint={colors.text.secondary}
					selectedIconTint={colors.brand.primary}
					style={styles.toolbar}
				/>
				<RichEditor
					ref={editorRef}
					// RichEditor native View background (prevents Android WebView white flash)
					style={[styles.editor, { backgroundColor: colors.input.background, minHeight }]}
					editorStyle={editorStyle}
					initialContentHTML={initialContentHTML}
					placeholder={placeholder}
					onChange={handleChange}
					onBlur={onBlur}
					// Disable internal scroll — parent ScrollView handles scrolling
					scrollEnabled={false}
					useContainer={false}
					autoCorrect={false}
					autoCapitalize="sentences"
				/>
			</View>
		);
	},
);

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			borderWidth: 1,
			borderColor: colors.input.border,
			borderRadius: RADIUS.sm,
			overflow: "hidden",
			backgroundColor: colors.input.background,
		},
		toolbar: {
			backgroundColor: colors.background.elevated,
			borderBottomWidth: 1,
			borderBottomColor: colors.border.subtle,
			paddingHorizontal: SPACING[4],
		},
		editor: {
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[8],
		},
	});
}
