import { z } from "zod";

// ─── Reusable field schemas ──────────────────────────────────────────────────

// FR-08: letters/numbers/hyphens only; 2–20 chars (SRS); case already lowercased by addTag()
const tagSchema = z
	.string()
	.min(2, "Tag phải có ít nhất 2 ký tự")
	.max(20, "Tag tối đa 20 ký tự")
	.regex(/^[a-z0-9-]+$/, "Tag chỉ được chứa chữ cái, số và gạch ngang");

// FR-08: max 5 tags per entry (SRS FR-08: 0–5)
const tagsSchema = z.array(tagSchema).max(5, "Tối đa 5 thẻ").default([]);

const titleSchema = z.string().max(100, "Tiêu đề tối đa 100 ký tự").optional();

// ─── API-level create schema (includes content as string for reference) ──────

// FR-06: plain text content min 10, max 5000 chars (used for API-boundary reference only)
const contentSchema = z
	.string()
	.min(10, "Nhật ký phải có ít nhất 10 ký tự")
	.max(5000, "Nhật ký không được vượt quá 5000 ký tự");

export const createEntrySchema = z.object({
	title: titleSchema,
	content: contentSchema,
	tags: tagsSchema,
});

export type CreateEntryApiValues = z.infer<typeof createEntrySchema>;

// ─── Form schemas — content managed externally by RichTextEditor ─────────────

// FR-06, FR-08: form only tracks title + tags; content lives in deltaRef
export const createEntryFormSchema = z.object({
	title: titleSchema,
	tags: tagsSchema,
});

export type CreateEntryFormValues = z.infer<typeof createEntryFormSchema>;

// ─── Edit entry form (FR-09) ─────────────────────────────────────────────────

export const editEntryFormSchema = createEntryFormSchema;
export type EditEntryFormValues = CreateEntryFormValues;

// Keep for any downstream consumers that imported the old editEntrySchema name
export const editEntrySchema = createEntryFormSchema;
