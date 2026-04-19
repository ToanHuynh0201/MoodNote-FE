import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s, vs } from "@/utils";
import { StreakIcon } from "./StreakIcon";
import type { StreakIconType } from "./StreakIcon";

interface Props {
	iconType: StreakIconType;
	count: number;
	label: string;
	isHighlighted?: boolean;
	iconBgColor?: string;
}

export function StreakCard({ iconType, count, label, isHighlighted = false, iconBgColor }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const effectiveIconBg = iconBgColor ?? colors.brand.surface;
	const iconSize = isHighlighted ? s(32) : s(28);

	return (
		<View style={[styles.card, isHighlighted && styles.cardHighlighted]}>
			<View style={[styles.iconCircle, isHighlighted && styles.iconCircleHighlighted, { backgroundColor: effectiveIconBg }]}>
				<StreakIcon type={iconType} size={iconSize} />
			</View>
			<View style={styles.countRow}>
				<Text style={[styles.count, isHighlighted && styles.countHighlighted]}>{count}</Text>
				<Text style={[styles.unit, isHighlighted && styles.unitHighlighted]}> ngày</Text>
			</View>
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
			backgroundColor: colors.background.card,
			borderRadius: s(16),
			paddingBottom: SPACING[16],
			paddingHorizontal: SPACING[8],
			gap: vs(8),
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: vs(3) },
			shadowOpacity: 0.12,
			shadowRadius: s(8),
			elevation: 4,
		},
		cardHighlighted: {
			backgroundColor: colors.brand.surface,
			marginBottom: vs(12),
		},
		iconCircle: {
			width: s(48),
			height: s(48),
			borderRadius: s(24),
			alignItems: "center",
			justifyContent: "center",
			marginTop: -s(24),
		},
		iconCircleHighlighted: {
			width: s(56),
			height: s(56),
			borderRadius: s(28),
			marginTop: -s(28),
		},
		countRow: {
			flexDirection: "row",
			alignItems: "baseline",
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
		unit: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
		unitHighlighted: {
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
