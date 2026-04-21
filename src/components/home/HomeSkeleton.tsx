import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SkeletonLoader } from "@/components/ui/feedback";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";

const STREAK_CARDS = [0, 1, 2] as const;
const ENTRY_ITEMS = [0, 1, 2] as const;
const TRACK_ITEMS = [0, 1, 2, 3] as const;

export function HomeSkeleton() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}>

				{/* App title */}
				<View style={styles.header}>
					<SkeletonLoader width={s(120)} height={vs(28)} borderRadius={RADIUS.full} />
				</View>

				{/* Greeting row */}
				<View style={styles.greetingRow}>
					<SkeletonLoader width={s(52)} height={s(52)} borderRadius={s(26)} />
					<View style={styles.greetingText}>
						<SkeletonLoader width="55%" height={vs(22)} borderRadius={RADIUS.full} />
						<SkeletonLoader width="80%" height={vs(14)} borderRadius={RADIUS.full} />
					</View>
				</View>

				{/* Streak row */}
				<View style={styles.streakRow}>
					{STREAK_CARDS.map((i) => (
						<View key={i} style={styles.streakCard}>
							<SkeletonLoader
								width={s(48)}
								height={s(48)}
								borderRadius={s(24)}
								style={styles.streakIcon}
							/>
							<SkeletonLoader width={s(48)} height={vs(28)} borderRadius={RADIUS.full} />
							<SkeletonLoader width="85%" height={vs(14)} borderRadius={RADIUS.full} />
							<SkeletonLoader width="60%" height={vs(14)} borderRadius={RADIUS.full} />
						</View>
					))}
				</View>

				{/* Recent entries section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<SkeletonLoader width={s(120)} height={vs(18)} borderRadius={RADIUS.full} />
						<SkeletonLoader width={s(56)} height={vs(16)} borderRadius={RADIUS.full} />
					</View>
					{ENTRY_ITEMS.map((i) => (
						<View key={i} style={styles.entryItem}>
							<View style={styles.entryItemLeft}>
								<SkeletonLoader width="65%" height={vs(16)} borderRadius={RADIUS.full} />
								<SkeletonLoader width="100%" height={vs(13)} borderRadius={RADIUS.full} />
								<SkeletonLoader width="80%" height={vs(13)} borderRadius={RADIUS.full} />
							</View>
							<View style={styles.entryItemRight}>
								<SkeletonLoader width={s(20)} height={s(20)} borderRadius={RADIUS.full} />
								<SkeletonLoader width={s(36)} height={vs(12)} borderRadius={RADIUS.full} />
							</View>
						</View>
					))}
				</View>

				{/* Playlist section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<SkeletonLoader width={s(112)} height={vs(18)} borderRadius={RADIUS.full} />
						<SkeletonLoader width={s(56)} height={vs(16)} borderRadius={RADIUS.full} />
					</View>
					{TRACK_ITEMS.map((i) => (
						<View key={i} style={[styles.trackItem, i < TRACK_ITEMS.length - 1 && styles.trackItemBorder]}>
							<SkeletonLoader width={s(48)} height={vs(48)} borderRadius={RADIUS.sm} />
							<View style={styles.trackInfo}>
								<SkeletonLoader width="70%" height={vs(16)} borderRadius={RADIUS.full} />
								<SkeletonLoader width="50%" height={vs(13)} borderRadius={RADIUS.full} />
							</View>
						</View>
					))}
				</View>

			</ScrollView>
		</SafeAreaView>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		safeArea: {
			flex: 1,
			backgroundColor: colors.background.primary,
		},
		scroll: {
			flex: 1,
		},
		content: {
			paddingHorizontal: SPACING[16],
			paddingBottom: vs(32),
		},
		header: {
			alignItems: "center",
			paddingTop: SPACING[12],
			paddingBottom: SPACING[16],
		},
		greetingRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(12),
			marginBottom: SPACING[20],
		},
		greetingText: {
			flex: 1,
			gap: vs(4),
		},
		streakRow: {
			flexDirection: "row",
			paddingTop: s(28),
			gap: s(8),
			marginBottom: SPACING[24],
		},
		streakCard: {
			flex: 1,
			alignItems: "center",
			borderRadius: s(16),
			backgroundColor: colors.background.card,
			paddingBottom: SPACING[16],
			gap: vs(6),
		},
		streakIcon: {
			marginTop: -s(24),
		},
		section: {
			marginBottom: SPACING[24],
		},
		sectionHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginBottom: SPACING[12],
		},
		entryItem: {
			flexDirection: "row",
			borderRadius: RADIUS.md,
			backgroundColor: colors.background.card,
			padding: SPACING[14],
			marginBottom: SPACING[8],
		},
		entryItemLeft: {
			flex: 1,
			gap: vs(5),
		},
		entryItemRight: {
			alignItems: "flex-end",
			gap: vs(4),
			marginLeft: s(8),
		},
		trackItem: {
			flexDirection: "row",
			gap: s(12),
			paddingVertical: SPACING[10],
		},
		trackItemBorder: {
			borderBottomWidth: 1,
			borderBottomColor: colors.border.subtle,
		},
		trackInfo: {
			flex: 1,
			gap: vs(4),
		},
	});
}
