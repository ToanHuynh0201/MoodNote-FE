import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonLoader } from "@/components/ui/feedback";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;

export function WeeklySectionSkeleton() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View>
			{/* Chart rectangle */}
			<View style={styles.chartContainer}>
				<SkeletonLoader width="100%" height={vs(180)} borderRadius={RADIUS.lg} />
			</View>

			{/* Day labels row */}
			<View style={styles.labelsRow}>
				{DAY_INDICES.map((i) => (
					<View key={i} style={styles.labelCell}>
						<SkeletonLoader width={s(24)} height={vs(12)} borderRadius={RADIUS.full} />
					</View>
				))}
			</View>

			{/* "Tổng quan" label */}
			<SkeletonLoader
				width={s(64)}
				height={vs(16)}
				borderRadius={RADIUS.full}
				style={styles.overviewLabel}
			/>

			{/* WeeklyOverview row */}
			<View style={styles.overviewRow}>
				{DAY_INDICES.map((i) => (
					<View key={i} style={styles.overviewCell}>
						<SkeletonLoader width={s(34)} height={s(34)} borderRadius={RADIUS.full} />
						<SkeletonLoader width={s(22)} height={vs(12)} borderRadius={RADIUS.full} />
					</View>
				))}
			</View>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		chartContainer: {
			paddingVertical: SPACING[16],
			marginBottom: SPACING[12],
		},
		labelsRow: {
			flexDirection: "row",
			marginBottom: SPACING[12],
		},
		labelCell: {
			flex: 1,
			alignItems: "center",
		},
		overviewLabel: {
			marginBottom: SPACING[8],
		},
		overviewRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			paddingVertical: SPACING[12],
			paddingHorizontal: SPACING[8],
		},
		overviewCell: {
			alignItems: "center",
			gap: vs(4),
		},
	});
}
