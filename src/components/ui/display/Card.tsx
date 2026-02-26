import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { CardProps } from "@/types";

export function Card({
	children,
	variant = "elevated",
	padding,
	style,
	...rest
}: CardProps) {
	const colors = useThemeColors();
	const resolvedPadding = padding === false ? 0 : (padding ?? 16);
	const styles = useMemo(
		() => createStyles(colors, resolvedPadding),
		[colors, resolvedPadding],
	);

	return (
		<View style={[styles.base, styles[variant], style]} {...rest}>
			{children}
		</View>
	);
}

function createStyles(colors: ThemeColors, padding: number) {
	return StyleSheet.create({
		base: {
			borderRadius: 12,
			padding,
			backgroundColor: colors.background.card,
		},
		elevated: {
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.08,
			shadowRadius: 8,
			elevation: 3,
		},
		flat: {},
		bordered: {
			borderWidth: 1,
			borderColor: colors.border.subtle,
		},
	});
}
