// Badge/chip component — used for emotion labels and tags (FR-08)
// TODO: Add size variants, close/dismiss button for tag chips

import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";

interface BadgeProps {
	label: string;
	/** Background color — defaults to `colors.brand.surface`. Pass a theme token value. */
	color?: string;
	/** Text color — defaults to `colors.brand.primary`. Pass a theme token value. */
	textColor?: string;
}

export function Badge({ label, color, textColor }: BadgeProps) {
	const colors = useThemeColors();
	const bgColor = color ?? colors.brand.surface;
	const txtColor = textColor ?? colors.brand.primary;
	const styles = useMemo(
		() => createStyles(colors, bgColor, txtColor),
		[colors, bgColor, txtColor],
	);

	return (
		<View style={styles.badge}>
			<Text style={styles.text}>{label}</Text>
		</View>
	);
}

function createStyles(_colors: ThemeColors, bgColor: string, txtColor: string) {
	return StyleSheet.create({
		badge: {
			borderRadius: 999,
			paddingVertical: 3,
			paddingHorizontal: 10,
			alignSelf: "flex-start",
			backgroundColor: bgColor,
		},
		text: { fontSize: 12, fontWeight: "500", color: txtColor },
	});
}
