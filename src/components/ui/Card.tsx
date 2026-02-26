// Reusable Card container component
// TODO: Add shadow, elevation, border-radius variants

import { useMemo } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";

interface CardProps extends ViewProps {
	children: React.ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={[styles.card, style]} {...rest}>
			{children}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		card: {
			backgroundColor: colors.background.card,
			borderRadius: 12,
			padding: 16,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.06,
			shadowRadius: 8,
			elevation: 2,
		},
	});
}
