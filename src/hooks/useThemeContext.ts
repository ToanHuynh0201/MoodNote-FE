import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";
import type { ThemeContextValue } from "@/contexts/ThemeContext";

/**
 * Access the full theme context: colorScheme, colors, setTheme, toggleTheme.
 *
 * Use this when you need to read or change the active theme.
 * For colors only, prefer useThemeColors() instead.
 *
 * @example
 * const { colorScheme, toggleTheme } = useThemeContext();
 */
export function useThemeContext(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useThemeContext must be used inside <ThemeProvider>");
	}
	return ctx;
}
