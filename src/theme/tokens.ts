/**
 * ThemeColors interface — the structural contract every theme must satisfy.
 *
 * Both DARK_THEME (dark.ts) and LIGHT_THEME (light.ts) are annotated against
 * this interface so TypeScript enforces structural completeness at definition time.
 *
 * Components consume this type via useThemeColors() from @/hooks.
 */

import type { MoodColors } from "./mood";

export type ColorScheme = "light" | "dark";

export interface ThemeColors {
	background: {
		/** Main app screen background */
		primary: string;
		/** Offset sections, secondary screens */
		secondary: string;
		/** Card and surface containers */
		card: string;
		/** Modals, bottom sheets, popovers */
		elevated: string;
		/** Scrim / backdrop overlay */
		overlay: string;
	};

	text: {
		/** Primary body text */
		primary: string;
		/** Secondary / supporting text */
		secondary: string;
		/** Muted / disabled text */
		muted: string;
		/** Input placeholder text */
		placeholder: string;
		/** Text rendered on top of brand-colored surfaces */
		inverse: string;
		/** Hyperlinks and tappable text */
		link: string;
	};

	brand: {
		/** Primary accent — CTAs, active states */
		primary: string;
		/** Primary accent pressed / active state */
		primaryPressed: string;
		/** Secondary accent */
		secondary: string;
		/** Streak counters, rewards, highlights */
		highlight: string;
		/** Subtle brand-tinted background — chips, tags, badges */
		surface: string;
		/** Text and icons rendered on top of brand.primary surfaces */
		onPrimary: string;
	};

	border: {
		/** Default dividers and borders */
		default: string;
		/** Subtle / low-emphasis borders */
		subtle: string;
		/** Strong / focused borders */
		strong: string;
	};

	status: {
		error: string;
		errorBackground: string;
		success: string;
		successBackground: string;
		warning: string;
		warningBackground: string;
		/** Informational / neutral status */
		info: string;
		infoBackground: string;
	};

	/** Interactive element state colors */
	interactive: {
		/** Disabled foreground (text/icon) */
		disabled: string;
		/** Disabled background */
		disabledBackground: string;
	};

	nav: {
		/** Tab bar / navigation bar background */
		background: string;
		/** Semi-transparent bg for liquid glass BlurView overlay */
		backgroundGlass: string;
		activeIcon: string;
		inactiveIcon: string;
		/** Active tab label tint */
		activeTint: string;
		/** Inactive tab label tint */
		inactiveTint: string;
	};

	input: {
		background: string;
		border: string;
		borderFocused: string;
		borderError: string;
		text: string;
		placeholder: string;
		label: string;
	};

	/** Emotion colors — same across themes (data-semantic) */
	mood: MoodColors;

	/** Drop shadow color */
	shadow: string;
	/** Default icon tint */
	iconDefault: string;
	/** Horizontal rule / list separator */
	divider: string;
}
