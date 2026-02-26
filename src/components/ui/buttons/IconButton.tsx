import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { IconButtonProps } from "@/types";

export function IconButton({
	icon,
	onPress,
	size = "md",
	variant = "ghost",
	accessibilityLabel,
	hitSlop = 8,
	disabled,
}: IconButtonProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<Pressable
			style={[styles.base, styles[size], styles[variant], disabled && styles.disabled]}
			onPress={onPress}
			disabled={disabled}
			hitSlop={hitSlop}
			accessibilityLabel={accessibilityLabel}
			accessibilityRole="button">
			{icon}
		</Pressable>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		base: {
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 999,
		},
		// Sizes
		sm: { width: 32, height: 32 },
		md: { width: 40, height: 40 },
		lg: { width: 48, height: 48 },
		// Variants
		ghost: { backgroundColor: "transparent" },
		filled: { backgroundColor: colors.background.elevated },
		outline: {
			backgroundColor: "transparent",
			borderWidth: 1,
			borderColor: colors.border.default,
		},
		// State
		disabled: { opacity: 0.5 },
	});
}
