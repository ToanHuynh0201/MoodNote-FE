import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, RADIUS, SPACING } from "@/theme";
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
					style={styles.actionBtn}
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
			marginBottom: SPACING[12],
		},
		title: {
			fontSize: FONT_SIZE[17],
			fontWeight: "600",
			color: colors.text.primary,
		},
		actionBtn: {
			borderWidth: 1,
			borderColor: colors.border.default,
			borderRadius: RADIUS.full,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[4],
		},
		action: {
			fontSize: FONT_SIZE[12],
			color: colors.text.secondary,
		},
	});
}
