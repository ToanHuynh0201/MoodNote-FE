/**
 * Raw color palette — the single source of truth for every hex value in the app.
 *
 * Rules:
 * - This file is the ONLY place where hex values are written.
 * - Do NOT import PALETTE in components or hooks.
 * - Use semantic tokens from dark.ts / light.ts via useThemeColors() instead.
 */

export const PALETTE = {
	// ── Brand purples (Figma-derived) ────────────────────────────────────────
	purple: {
		100: "#EDE9FE", // brand tint backgrounds
		200: "#C4A8FF", // muted brand
		300: "#9B59F5", // secondary accent
		400: "#7B35D8", // primary CTA, active nav icon
		500: "#3D1E7A", // subtle borders, pressed states
		600: "#2A1550", // elevated surfaces, borders
		700: "#1A0B32", // card surfaces
		800: "#150A2E", // secondary background / nav bar
		900: "#0D0520", // main app background
	},

	// ── Neutrals ─────────────────────────────────────────────────────────────
	neutral: {
		white: "#FFFFFF",
		50: "#F8F9FA",
		100: "#F1F5F9",
		200: "#CBD5E1",
		300: "#94A3B8",
		400: "#64748B",
		500: "#475569",
		800: "#1E293B",
		900: "#0F172A",
		black: "#000000",
	},

	// ── Status ───────────────────────────────────────────────────────────────
	status: {
		errorLight: "#F87171", // for dark backgrounds
		errorDark: "#EF4444", // for light backgrounds
		successLight: "#4ADE80",
		successDark: "#22C55E",
		warningLight: "#FBD38D",
		warningDark: "#F6AD55",
	},

	// ── Highlight ────────────────────────────────────────────────────────────
	highlight: {
		orange: "#FF6B35", // streak, rewards
	},

	// ── Overlays ─────────────────────────────────────────────────────────────
	overlay: {
		dark: "rgba(13, 5, 32, 0.50)",
		light: "rgba(0, 0, 0, 0.40)",
	},

	// ── Info Blue ─────────────────────────────────────────────────
	info: {
		dark: "#74B0FF", // on dark backgrounds
		light: "#2563EB", // on light backgrounds
	},

	// ── Brand Surface ──────────────────────────────────────────────
	brandSurface: {
		dark: "rgba(123, 53, 216, 0.18)", // dark theme subtle brand tint
	},

	// ── Status Backgrounds ─────────────────────────────────────────
	statusBackground: {
		errorDark: "rgba(248, 113, 113, 0.12)",
		errorLight: "rgba(239, 68, 68, 0.08)",
		successDark: "rgba(74, 222, 128, 0.12)",
		successLight: "rgba(34, 197, 94, 0.08)",
		warningDark: "rgba(251, 211, 141, 0.12)",
		warningLight: "rgba(246, 173, 85, 0.08)",
		infoDark: "rgba(116, 176, 255, 0.12)",
		infoLight: "rgba(37, 99, 235, 0.08)",
	},
} as const;
