import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE } from "@/theme";

// FR-06: Journal list screen — placeholder
export default function JournalScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Nhật ký</Text>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: colors.background.primary,
		},
		text: {
			fontSize: FONT_SIZE[17],
			color: colors.text.secondary,
		},
	});
}
