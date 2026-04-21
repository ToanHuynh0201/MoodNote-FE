import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonLoader } from "@/components/ui/feedback";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";

const COL_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;
const ROW_INDICES = [0, 1, 2, 3, 4, 5] as const;

export function CalendarSkeleton() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.card}>
			{/* Month header */}
			<View style={styles.monthHeader}>
				<SkeletonLoader width={s(72)} height={vs(20)} borderRadius={RADIUS.full} />
				<View style={styles.navArrows}>
					<SkeletonLoader width={s(20)} height={s(20)} borderRadius={RADIUS.full} />
					<SkeletonLoader width={s(20)} height={s(20)} borderRadius={RADIUS.full} />
				</View>
			</View>

			{/* Weekday headers */}
			<View style={styles.headerRow}>
				{COL_INDICES.map((i) => (
					<View key={i} style={styles.headerCell}>
						<SkeletonLoader width={s(16)} height={vs(14)} borderRadius={RADIUS.full} />
					</View>
				))}
			</View>

			{/* 6 × 7 grid */}
			{ROW_INDICES.map((row) => (
				<View key={row} style={styles.gridRow}>
					{COL_INDICES.map((col) => (
						<View key={col} style={styles.gridCell}>
							<SkeletonLoader width={s(14)} height={vs(13)} borderRadius={RADIUS.full} />
							<SkeletonLoader width={s(22)} height={s(22)} borderRadius={RADIUS.full} />
						</View>
					))}
				</View>
			))}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		card: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			padding: SPACING[16],
		},
		monthHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: SPACING[12],
		},
		navArrows: {
			flexDirection: "row",
			gap: s(8),
		},
		headerRow: {
			flexDirection: "row",
			marginBottom: SPACING[4],
		},
		headerCell: {
			flex: 1,
			alignItems: "center",
		},
		gridRow: {
			flexDirection: "row",
		},
		gridCell: {
			flex: 1,
			alignItems: "center",
			paddingVertical: vs(4),
			gap: vs(2),
		},
	});
}
