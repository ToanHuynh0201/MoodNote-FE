import { MOOD_COLORS } from "./mood";
import { PALETTE } from "./palette";
import type { ThemeColors } from "./tokens";

/**
 * Dark theme — primary theme, matches Figma designs.
 */
export const DARK_THEME: ThemeColors = {
	background: {
		primary: PALETTE.purple[900],
		secondary: PALETTE.purple[800],
		card: PALETTE.purple[700],
		elevated: PALETTE.purple[600],
		overlay: PALETTE.overlay.dark,
		gradientStart: PALETTE.purple[800],
		gradientEnd: PALETTE.purple[900],
		glassCard: PALETTE.glass.cardDark,
		skeleton: PALETTE.purple[600],
		skeletonHighlight: PALETTE.purple[500],
	},

	text: {
		primary: PALETTE.neutral.white,
		secondary: PALETTE.neutral[200],
		muted: PALETTE.neutral[300],
		placeholder: PALETTE.neutral[400],
		inverse: PALETTE.purple[900],
		link: PALETTE.purple[300],
	},

	brand: {
		primary: PALETTE.purple[400],
		primaryPressed: PALETTE.purple[500],
		secondary: PALETTE.purple[300],
		highlight: PALETTE.highlight.orange,
		surface: PALETTE.brandSurface.dark,
		onPrimary: PALETTE.neutral.white,
	},

	border: {
		default: PALETTE.purple[600],
		subtle: PALETTE.purple[500],
		strong: PALETTE.purple[400],
	},

	status: {
		error: PALETTE.status.errorLight,
		errorBackground: PALETTE.statusBackground.errorDark,
		success: PALETTE.status.successLight,
		successBackground: PALETTE.statusBackground.successDark,
		warning: PALETTE.status.warningLight,
		warningBackground: PALETTE.statusBackground.warningDark,
		info: PALETTE.info.dark,
		infoBackground: PALETTE.statusBackground.infoDark,
	},

	interactive: {
		disabled: PALETTE.neutral[400],
		disabledBackground: PALETTE.purple[700],
	},

	nav: {
		background: PALETTE.purple[800],
		backgroundGlass: PALETTE.glass.dark,
		activeIcon: PALETTE.purple[400],
		inactiveIcon: PALETTE.neutral[400],
		activeTint: PALETTE.purple[400],
		inactiveTint: PALETTE.neutral[400],
	},

	input: {
		background: PALETTE.purple[700],
		border: PALETTE.purple[600],
		borderFocused: PALETTE.purple[400],
		borderError: PALETTE.status.errorLight,
		text: PALETTE.neutral.white,
		placeholder: PALETTE.neutral[400],
		label: PALETTE.neutral[200],
	},

	mood: MOOD_COLORS,

	shadow: PALETTE.neutral.black,
	iconDefault: PALETTE.neutral[400],
	divider: PALETTE.purple[600],
};
