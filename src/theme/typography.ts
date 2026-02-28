/**
 * Typography constants — fixed font sizes and line heights.
 *
 * NOT scaled with s() / ms() — typography uses absolute pt sizes
 * for consistent visual hierarchy across phone sizes.
 *
 * FONT_SIZE keys are the raw px design values for easy mapping
 * from existing hardcoded values during migration.
 */

// ── Font sizes ────────────────────────────────────────────────────────────────

export const FONT_SIZE = {
	11: 11, // Badge sm
	12: 12, // error/hint/charCount/divider label
	13: 13, // Button sm, Badge md, ToggleSwitch sublabel
	14: 14, // Input label, SectionHeader action, EmptyState subtitle
	15: 15, // Button md, Input text, TextArea text, ConfirmationDialog message
	17: 17, // Button lg, SectionHeader title, Modal title, EmptyState title
	18: 18, // ConfirmationDialog title
	22: 22, // Avatar lg initials
} as const;

export type FontSizeToken = keyof typeof FONT_SIZE;

// ── Line heights ──────────────────────────────────────────────────────────────

export const LINE_HEIGHT = {
	tight:   18, // labels, buttons
	normal:  20, // body, hints, subtitles
	relaxed: 22, // message bodies
	loose:   26, // dialog messages
} as const;

export type LineHeightToken = keyof typeof LINE_HEIGHT;
