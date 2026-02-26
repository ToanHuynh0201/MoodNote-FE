// Reusable Button component
// TODO: Implement with proper variants (primary, secondary, outline, ghost),
// loading state, disabled state, icon support

import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";

interface ButtonProps {
	title: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "outline" | "ghost";
	loading?: boolean;
	disabled?: boolean;
	accessibilityLabel?: string;
}

export function Button({
	title,
	onPress,
	variant = "primary",
	loading,
	disabled,
	accessibilityLabel,
}: ButtonProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const isBrandText = variant === "outline" || variant === "ghost";
	// activityIndicator needs a raw color string, not a style
	const spinnerColor = isBrandText ? colors.brand.primary : colors.text.inverse;

	return (
		<Pressable
			style={[styles.base, styles[variant], (disabled || loading) && styles.disabled]}
			onPress={onPress}
			disabled={disabled || loading}
			accessibilityLabel={accessibilityLabel ?? title}
			accessibilityRole="button">
			{loading ? (
				<ActivityIndicator color={spinnerColor} />
			) : (
				<Text style={isBrandText ? styles.textBrand : styles.textInverse}>{title}</Text>
			)}
		</Pressable>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		base: {
			borderRadius: 8,
			paddingVertical: 12,
			paddingHorizontal: 24,
			alignItems: "center",
		},
		primary: { backgroundColor: colors.brand.primary },
		secondary: { backgroundColor: colors.brand.secondary },
		outline: {
			backgroundColor: "transparent",
			borderWidth: 1,
			borderColor: colors.brand.primary,
		},
		ghost: { backgroundColor: "transparent" },
		disabled: { opacity: 0.5 },
		textInverse: { fontWeight: "600", fontSize: 16, color: colors.text.inverse },
		textBrand: { fontWeight: "600", fontSize: 16, color: colors.brand.primary },
	});
}
