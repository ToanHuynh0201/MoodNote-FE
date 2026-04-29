import { z } from "zod";

// ─── Reusable field schemas ──────────────────────────────────────────────────

// FR-08: max 5 tag UUIDs per entry
const tagIdsSchema = z
	.array(z.string().uuid("ID tag không hợp lệ"))
	.max(5, "Tối đa 5 thẻ")
	.default([]);

const titleSchema = z.string().max(100, "Tiêu đề tối đa 100 ký tự").optional();

// ─── Client-side content length reference (not used for API calls) ───────────

// FR-06: validates plain text length extracted from Delta — used only in screens
// that check length before calling entryService. API call uses CreateEntryPayload.
const contentSchema = z
	.string()
	.min(10, "Nhật ký phải có ít nhất 10 ký tự")
	.max(5000, "Nhật ký không được vượt quá 5000 ký tự");

export const createEntrySchema = z.object({
	title: titleSchema,
	content: contentSchema,
	tagIds: tagIdsSchema,
});

export type CreateEntryApiValues = z.infer<typeof createEntrySchema>;

// ─── Form schemas — content managed externally by RichTextEditor ─────────────

// FR-06, FR-08: form only tracks title + tagIds; content lives in deltaRef
export const createEntryFormSchema = z.object({
	title: titleSchema,
	tagIds: tagIdsSchema,
});

export type CreateEntryFormValues = z.infer<typeof createEntryFormSchema>;

// ─── Edit entry form (FR-09) ─────────────────────────────────────────────────

export const editEntryFormSchema = createEntryFormSchema;
export type EditEntryFormValues = CreateEntryFormValues;

export const editEntrySchema = createEntryFormSchema;
