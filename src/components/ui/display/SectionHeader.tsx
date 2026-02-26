import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { SectionHeaderProps } from "@/types";

export function SectionHeader({ title, action }: SectionHeaderProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.row}>
			<Text style={styles.title}>{title}</Text>
			{action != null && (
				<Pressable
					onPress={action.onPress}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel={action.label}>
					<Text style={styles.action}>{action.label}</Text>
				</Pressable>
			)}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			marginBottom: 12,
		},
		title: {
			fontSize: 17,
			fontWeight: "600",
			color: colors.text.primary,
		},
		action: {
			fontSize: 14,
			color: colors.text.link,
		},
	});
}
