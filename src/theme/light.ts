import { MOOD_COLORS } from "./mood";
import { PALETTE } from "./palette";
import type { ThemeColors } from "./tokens";

/**
 * Light theme — to be refined when Figma light mode designs are ready.
 * Uses neutral whites/grays for backgrounds with the same brand purple accents.
 */
export const LIGHT_THEME: ThemeColors = {
	background: {
		primary: PALETTE.purple[100],
		secondary: PALETTE.neutral.white,
		card: PALETTE.neutral.white,
		elevated: PALETTE.neutral.white,
		overlay: PALETTE.overlay.light,
		gradientStart: PALETTE.purple[50],
		gradientEnd: PALETTE.purple[100],
		glassCard: PALETTE.glass.cardLight,
		skeleton: PALETTE.neutral[200],
		skeletonHighlight: PALETTE.neutral[50],
	},

	text: {
		primary: PALETTE.neutral[900],
		secondary: PALETTE.neutral[800],
		muted: PALETTE.neutral[500],
		placeholder: PALETTE.neutral[400],
		inverse: PALETTE.neutral.white,
		link: PALETTE.purple[400],
	},

	brand: {
		primary: PALETTE.purple[400],
		primaryPressed: PALETTE.purple[500],
		secondary: PALETTE.purple[300],
		highlight: PALETTE.highlight.orange,
		surface: PALETTE.purple[100],
		onPrimary: PALETTE.neutral.white,
	},

	border: {
		default: PALETTE.neutral[200],
		subtle: PALETTE.neutral[100],
		strong: PALETTE.purple[400],
	},

	status: {
		error: PALETTE.status.errorDark,
		errorBackground: PALETTE.statusBackground.errorLight,
		success: PALETTE.status.successDark,
		successBackground: PALETTE.statusBackground.successLight,
		warning: PALETTE.status.warningDark,
		warningBackground: PALETTE.statusBackground.warningLight,
		info: PALETTE.info.light,
		infoBackground: PALETTE.statusBackground.infoLight,
	},

	interactive: {
		disabled: PALETTE.neutral[300],
		disabledBackground: PALETTE.neutral[100],
	},

	nav: {
		background: PALETTE.neutral.white,
		backgroundGlass: PALETTE.glass.light,
		activeIcon: PALETTE.purple[400],
		inactiveIcon: PALETTE.neutral[400],
		activeTint: PALETTE.purple[400],
		inactiveTint: PALETTE.neutral[400],
	},

	input: {
		background: PALETTE.neutral.white,
		border: PALETTE.neutral[200],
		borderFocused: PALETTE.purple[400],
		borderError: PALETTE.status.errorDark,
		text: PALETTE.neutral[900],
		placeholder: PALETTE.neutral[400],
		label: PALETTE.neutral[800],
	},

	mood: MOOD_COLORS,

	shadow: PALETTE.neutral.black,
	iconDefault: PALETTE.neutral[400],
	divider: PALETTE.neutral[200],
};
