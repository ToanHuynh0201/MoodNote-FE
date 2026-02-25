import { PALETTE } from "./palette";
import { MOOD_COLORS } from "./mood";
import type { ThemeColors } from "./tokens";

/**
 * Dark theme — primary theme, matches Figma designs.
 */
export const DARK_THEME: ThemeColors = {
	background: {
		primary:   PALETTE.purple[900],
		secondary: PALETTE.purple[800],
		card:      PALETTE.purple[700],
		elevated:  PALETTE.purple[600],
		overlay:   PALETTE.overlay.dark,
	},

	text: {
		primary:     PALETTE.neutral.white,
		secondary:   PALETTE.neutral[200],
		muted:       PALETTE.neutral[300],
		placeholder: PALETTE.neutral[400],
		inverse:     PALETTE.purple[900],
		link:        PALETTE.purple[300],
	},

	brand: {
		primary:        PALETTE.purple[400],
		primaryPressed: PALETTE.purple[500],
		secondary:      PALETTE.purple[300],
		highlight:      PALETTE.highlight.orange,
	},

	border: {
		default: PALETTE.purple[600],
		subtle:  PALETTE.purple[500],
		strong:  PALETTE.purple[400],
	},

	status: {
		error:             PALETTE.status.errorLight,
		errorBackground:   "rgba(248, 113, 113, 0.12)",
		success:           PALETTE.status.successLight,
		successBackground: "rgba(74, 222, 128, 0.12)",
		warning:           PALETTE.status.warningLight,
		warningBackground: "rgba(251, 211, 141, 0.12)",
	},

	nav: {
		background:   PALETTE.purple[800],
		activeIcon:   PALETTE.purple[400],
		inactiveIcon: PALETTE.neutral[400],
		activeTint:   PALETTE.purple[400],
		inactiveTint: PALETTE.neutral[400],
	},

	input: {
		background:    PALETTE.purple[700],
		border:        PALETTE.purple[600],
		borderFocused: PALETTE.purple[400],
		borderError:   PALETTE.status.errorLight,
		text:          PALETTE.neutral.white,
		placeholder:   PALETTE.neutral[400],
		label:         PALETTE.neutral[200],
	},

	mood: MOOD_COLORS,

	shadow:      PALETTE.neutral.black,
	iconDefault: PALETTE.neutral[400],
	divider:     PALETTE.purple[600],
};
