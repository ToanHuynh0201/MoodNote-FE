import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import type { WeeklyDay } from "@/types/stats.types";
import { s, vs } from "@/utils";
import { EmotionIcon } from "./EmotionIcon";

interface Props {
	days: WeeklyDay[];
}

export function WeeklyOverview({ days }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			{days.map((day) => (
				<View key={day.date} style={styles.dayBox}>
					<EmotionIcon emotion={day.emotion} size={34} />
					<Text style={styles.label}>{day.dayLabel}</Text>
				</View>
			))}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flexDirection: "row",
			justifyContent: "space-between",
			backgroundColor: colors.background.glassCard,
			borderRadius: RADIUS.lg,
			paddingVertical: SPACING[12],
			paddingHorizontal: SPACING[8],
		},
		dayBox: {
			alignItems: "center",
			gap: vs(4),
		},
		label: {
			fontSize: FONT_SIZE[11],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
