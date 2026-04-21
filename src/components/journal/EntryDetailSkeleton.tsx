import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { SkeletonLoader } from "@/components/ui/feedback";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";

const BODY_LINE_WIDTHS = ["100%", "95%", "88%", "92%", "75%", "50%"] as const;

export function EntryDetailSkeleton() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<ScreenWrapper padded={false}>
			{/* Header row */}
			<View style={styles.header}>
				<SkeletonLoader width={s(24)} height={s(24)} borderRadius={RADIUS.full} />
				<SkeletonLoader width={s(80)} height={vs(16)} borderRadius={RADIUS.full} />
				<SkeletonLoader width={s(22)} height={s(22)} borderRadius={RADIUS.full} />
			</View>

			<ScrollView
				style={styles.flex}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>

				{/* Analysis status row */}
				<View style={styles.statusRow}>
					<SkeletonLoader width={s(6)} height={vs(6)} borderRadius={RADIUS.full} />
					<SkeletonLoader width={s(80)} height={vs(12)} borderRadius={RADIUS.full} />
				</View>

				{/* Title */}
				<SkeletonLoader
					width="65%"
					height={vs(28)}
					borderRadius={RADIUS.sm}
					style={styles.title}
				/>

				{/* Body lines */}
				{BODY_LINE_WIDTHS.map((w, i) => (
					<SkeletonLoader
						key={i}
						width={w}
						height={vs(16)}
						borderRadius={RADIUS.full}
						style={styles.bodyLine}
					/>
				))}

				{/* Tags row */}
				<View style={styles.tagsRow}>
					<SkeletonLoader width={s(56)} height={vs(24)} borderRadius={RADIUS.full} />
					<SkeletonLoader width={s(72)} height={vs(24)} borderRadius={RADIUS.full} />
					<SkeletonLoader width={s(48)} height={vs(24)} borderRadius={RADIUS.full} />
				</View>
			</ScrollView>
		</ScreenWrapper>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		flex: { flex: 1 },
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: SPACING[16],
			paddingVertical: SPACING[12],
			borderBottomWidth: 1,
			borderBottomColor: colors.border.subtle,
		},
		scrollContent: {
			paddingHorizontal: SPACING[20],
			paddingTop: SPACING[12],
			paddingBottom: vs(40),
		},
		statusRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(4),
			marginBottom: SPACING[12],
			alignSelf: "flex-start",
		},
		title: {
			marginBottom: SPACING[8],
		},
		bodyLine: {
			marginBottom: vs(10),
		},
		tagsRow: {
			flexDirection: "row",
			gap: s(6),
			marginTop: SPACING[16],
		},
	});
}
