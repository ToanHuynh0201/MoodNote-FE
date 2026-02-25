/**
 * Mood emotion colors.
 *
 * Based on Ekman's basic emotions model used in the MoodNote emotion analysis system.
 * These are data-semantic colors — they represent emotional states and remain
 * the same across both dark and light themes.
 *
 * Used in: emotion charts, mood badges, emoji indicators, daily reports.
 */

export const MOOD_COLORS = {
	enjoyment: "#FFD166",  // warm gold   — Vui vẻ
	disgust:   "#8BC34A",  // muted green — Ghê tởm
	sadness:   "#74B0FF",  // soft blue   — Buồn
	anger:     "#FF6B6B",  // warm red    — Tức giận
	fear:      "#C084FC",  // soft violet — Sợ hãi
	surprise:  "#F7931E",  // orange      — Ngạc nhiên
	other:     "#A0AEC0",  // neutral     — Khác
} as const;

export type MoodType = keyof typeof MOOD_COLORS;
export type MoodColors = typeof MOOD_COLORS;
