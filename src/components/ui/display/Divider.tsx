import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { DividerProps } from "@/types";

export function Divider({ label, spacing = 8 }: DividerProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors, spacing), [colors, spacing]);

	if (label != null) {
		return (
			<View style={styles.row}>
				<View style={styles.line} />
				<Text style={styles.label}>{label}</Text>
				<View style={styles.line} />
			</View>
		);
	}

	return <View style={styles.divider} />;
}

function createStyles(colors: ThemeColors, spacing: number) {
	return StyleSheet.create({
		divider: {
			height: 1,
			backgroundColor: colors.border.subtle,
			marginVertical: spacing,
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			marginVertical: spacing,
		},
		line: { flex: 1, height: 1, backgroundColor: colors.border.subtle },
		label: {
			fontSize: 12,
			color: colors.text.muted,
			marginHorizontal: 10,
		},
	});
}
