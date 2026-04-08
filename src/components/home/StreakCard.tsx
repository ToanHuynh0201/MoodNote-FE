import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s, vs } from "@/utils";

interface Props {
	icon: string;
	count: number;
	label: string;
	isHighlighted?: boolean;
}

export function StreakCard({ icon, count, label, isHighlighted = false }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={[styles.card, isHighlighted && styles.cardHighlighted]}>
			<Text style={styles.icon}>{icon}</Text>
			<Text style={[styles.count, isHighlighted && styles.countHighlighted]}>{count}</Text>
			<Text style={styles.label} numberOfLines={2}>
				{label}
			</Text>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		card: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			paddingVertical: SPACING[16],
			paddingHorizontal: SPACING[8],
			gap: vs(4),
		},
		cardHighlighted: {
			backgroundColor: colors.brand.surface,
		},
		icon: {
			fontSize: s(28),
		},
		count: {
			fontSize: FONT_SIZE[22],
			fontWeight: "700",
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.loose,
		},
		countHighlighted: {
			color: colors.brand.primary,
		},
		label: {
			fontSize: FONT_SIZE[11],
			color: colors.text.muted,
			textAlign: "center",
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
