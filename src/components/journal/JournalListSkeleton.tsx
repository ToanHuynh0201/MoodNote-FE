import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonLoader } from "@/components/ui/feedback";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";

const CARD_COUNT = [0, 1, 2, 3, 4] as const;

export function JournalListSkeleton() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.list}>
			{CARD_COUNT.map((i) => (
				<View key={i} style={styles.card}>
					{/* Header row: date + word count badge */}
					<View style={styles.headerRow}>
						<SkeletonLoader width={s(80)} height={vs(13)} borderRadius={RADIUS.full} />
						<SkeletonLoader width={s(40)} height={vs(20)} borderRadius={RADIUS.full} />
					</View>

					{/* Title */}
					<SkeletonLoader
						width="65%"
						height={vs(17)}
						borderRadius={RADIUS.full}
						style={styles.title}
					/>

					{/* Preview — 2 lines */}
					<SkeletonLoader width="100%" height={vs(14)} borderRadius={RADIUS.full} style={styles.previewLine} />
					<SkeletonLoader width="80%" height={vs(14)} borderRadius={RADIUS.full} style={styles.previewLine} />

					{/* Status row */}
					<View style={styles.statusRow}>
						<SkeletonLoader width={s(6)} height={vs(6)} borderRadius={RADIUS.full} />
						<SkeletonLoader width={s(72)} height={vs(12)} borderRadius={RADIUS.full} />
					</View>
				</View>
			))}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		list: {
			gap: SPACING[12],
		},
		card: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			padding: SPACING[16],
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.08,
			shadowRadius: 8,
			elevation: 3,
		},
		headerRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: SPACING[8],
		},
		title: {
			marginBottom: SPACING[4],
		},
		previewLine: {
			marginBottom: vs(6),
		},
		statusRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(4),
			marginTop: SPACING[8],
		},
	});
}
