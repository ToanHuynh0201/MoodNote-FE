import type { ThemeColors } from "@/theme/tokens";
import { useThemeContext } from "./useThemeContext";

/**
 * Returns the current theme's semantic color tokens.
 *
 * Shorthand for useThemeContext().colors — use this in any component
 * that only needs to read colors without toggling the theme.
 *
 * @example
 * const colors = useThemeColors();
 * // colors.background.card, colors.text.primary, colors.brand.primary
 */
export function useThemeColors(): ThemeColors {
	return useThemeContext().colors;
}
