import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

import { THEME_STORAGE_KEY } from "@/constants";
import { DARK_THEME } from "@/theme/dark";
import { LIGHT_THEME } from "@/theme/light";
import type { ColorScheme, ThemeColors } from "@/theme/tokens";
import { getStorageItem, setStorageItem } from "@/utils/storage";

// ─── Storage key ──────────────────────────────────────────────────────────────

// ─── Context shape ────────────────────────────────────────────────────────────

export interface ThemeContextValue {
	colorScheme: ColorScheme;
	colors: ThemeColors;
	setTheme: (scheme: ColorScheme) => void;
	toggleTheme: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
	children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const systemScheme = useColorScheme();

	// Initialize synchronously from system preference — no flash on first render.
	// Overridden by persisted user preference once loaded from storage.
	const [colorScheme, setColorScheme] = useState<ColorScheme>(
		systemScheme === "light" ? "light" : "dark",
	);

	// Load persisted preference on mount
	useEffect(() => {
		getStorageItem<ColorScheme>(THEME_STORAGE_KEY).then((saved) => {
			if (saved === "light" || saved === "dark") {
				setColorScheme(saved);
			}
		});
	}, []);

	const setTheme = useCallback((scheme: ColorScheme) => {
		setColorScheme(scheme);
		setStorageItem(THEME_STORAGE_KEY, scheme);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(colorScheme === "dark" ? "light" : "dark");
	}, [colorScheme, setTheme]);

	const value = useMemo(
		() => ({
			colorScheme,
			colors: colorScheme === "dark" ? DARK_THEME : LIGHT_THEME,
			setTheme,
			toggleTheme,
		}),
		[colorScheme, setTheme, toggleTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
