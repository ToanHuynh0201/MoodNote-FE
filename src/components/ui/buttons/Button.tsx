import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { ButtonProps } from "@/types";

export function Button({
	title,
	onPress,
	variant = "primary",
	size = "md",
	leftIcon,
	rightIcon,
	loading,
	disabled,
	fullWidth,
	accessibilityLabel,
}: ButtonProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const isTextVariant = variant === "outline" || variant === "ghost";
	const spinnerColor = isTextVariant ? colors.brand.primary : colors.text.inverse;
	const textColorStyle = isTextVariant ? styles.textBrand : styles.textInverse;
	const textSizeStyle =
		size === "sm" ? styles.textSm : size === "lg" ? styles.textLg : styles.textMd;
	const isDisabled = disabled || loading;

	return (
		<Pressable
			style={[
				styles.base,
				styles[variant],
				styles[size],
				fullWidth && styles.fullWidth,
				isDisabled && styles.disabled,
			]}
			onPress={onPress}
			disabled={isDisabled}
			accessibilityLabel={accessibilityLabel ?? title}
			accessibilityRole="button">
			{loading ? (
				<ActivityIndicator color={spinnerColor} />
			) : (
				<View style={styles.row}>
					{leftIcon != null && <View style={styles.iconLeft}>{leftIcon}</View>}
					<Text style={[textColorStyle, textSizeStyle]}>{title}</Text>
					{rightIcon != null && <View style={styles.iconRight}>{rightIcon}</View>}
				</View>
			)}
		</Pressable>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		base: {
			borderRadius: 8,
			alignItems: "center",
			justifyContent: "center",
		},
		// Variants
		primary: { backgroundColor: colors.brand.primary },
		secondary: { backgroundColor: colors.brand.secondary },
		outline: {
			backgroundColor: "transparent",
			borderWidth: 1.5,
			borderColor: colors.brand.primary,
		},
		ghost: { backgroundColor: "transparent" },
		danger: { backgroundColor: colors.status.error },
		// Sizes
		sm: { paddingVertical: 6, paddingHorizontal: 14, minHeight: 32 },
		md: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
		lg: { paddingVertical: 15, paddingHorizontal: 28, minHeight: 52 },
		// State
		fullWidth: { alignSelf: "stretch" },
		disabled: { opacity: 0.5 },
		// Row layout for icon + text
		row: { flexDirection: "row", alignItems: "center" },
		iconLeft: { marginRight: 6 },
		iconRight: { marginLeft: 6 },
		// Text colors
		textInverse: { fontWeight: "600", color: colors.text.inverse },
		textBrand: { fontWeight: "600", color: colors.brand.primary },
		// Text sizes
		textSm: { fontSize: 13 },
		textMd: { fontSize: 15 },
		textLg: { fontSize: 17 },
	});
}
