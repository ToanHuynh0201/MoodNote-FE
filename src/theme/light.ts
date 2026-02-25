import { PALETTE } from "./palette";
import { MOOD_COLORS } from "./mood";
import type { ThemeColors } from "./tokens";

/**
 * Light theme — to be refined when Figma light mode designs are ready.
 * Uses neutral whites/grays for backgrounds with the same brand purple accents.
 */
export const LIGHT_THEME: ThemeColors = {
	background: {
		primary:   PALETTE.neutral[50],
		secondary: PALETTE.neutral.white,
		card:      PALETTE.neutral.white,
		elevated:  PALETTE.neutral.white,
		overlay:   PALETTE.overlay.light,
	},

	text: {
		primary:     PALETTE.neutral[900],
		secondary:   PALETTE.neutral[800],
		muted:       PALETTE.neutral[500],
		placeholder: PALETTE.neutral[400],
		inverse:     PALETTE.neutral.white,
		link:        PALETTE.purple[400],
	},

	brand: {
		primary:        PALETTE.purple[400],
		primaryPressed: PALETTE.purple[500],
		secondary:      PALETTE.purple[300],
		highlight:      PALETTE.highlight.orange,
	},

	border: {
		default: PALETTE.neutral[200],
		subtle:  PALETTE.neutral[100],
		strong:  PALETTE.purple[400],
	},

	status: {
		error:             PALETTE.status.errorDark,
		errorBackground:   "rgba(239, 68, 68, 0.08)",
		success:           PALETTE.status.successDark,
		successBackground: "rgba(34, 197, 94, 0.08)",
		warning:           PALETTE.status.warningDark,
		warningBackground: "rgba(246, 173, 85, 0.08)",
	},

	nav: {
		background:   PALETTE.neutral.white,
		activeIcon:   PALETTE.purple[400],
		inactiveIcon: PALETTE.neutral[400],
		activeTint:   PALETTE.purple[400],
		inactiveTint: PALETTE.neutral[400],
	},

	input: {
		background:    PALETTE.neutral.white,
		border:        PALETTE.neutral[200],
		borderFocused: PALETTE.purple[400],
		borderError:   PALETTE.status.errorDark,
		text:          PALETTE.neutral[900],
		placeholder:   PALETTE.neutral[400],
		label:         PALETTE.neutral[800],
	},

	mood: MOOD_COLORS,

	shadow:      PALETTE.neutral.black,
	iconDefault: PALETTE.neutral[400],
	divider:     PALETTE.neutral[200],
};
