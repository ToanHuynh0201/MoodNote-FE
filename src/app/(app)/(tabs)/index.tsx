// FR-01, FR-06: Home screen — greeting, streak stats, recent entries, recent playlist

import { useCallback, useMemo } from "react";
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PlaylistTrackItem, RecentEntryItem, StreakCard } from "@/components/home";
import { SectionHeader } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useHomeData, useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s, vs } from "@/utils";
import { router } from "expo-router";

export default function HomeScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { data, isLoading, isRefreshing, refresh } = useHomeData();

	const handleViewAllEntries = useCallback(() => {
		router.push(ROUTES.TAB_JOURNAL);
	}, []);

	const handleViewPlaylist = useCallback(() => {
		if (data?.recentPlaylist?.entryId) {
			router.push(ROUTES.JOURNAL_DETAIL(data.recentPlaylist.entryId));
		}
	}, [data]);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.brand.primary} />
			</SafeAreaView>
		);
	}

	const { username, streaks, recentEntries, recentPlaylist } = data ?? {
		username: "",
		streaks: null,
		recentEntries: [],
		recentPlaylist: null,
	};

	const tracks = recentPlaylist?.tracks ?? [];

	return (
		<SafeAreaView style={styles.safeArea} edges={["top"]}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={refresh}
						tintColor={colors.brand.primary}
					/>
				}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.appTitle}>MoodNote</Text>
				</View>

				{/* Greeting */}
				<View style={styles.greetingRow}>
					<View style={styles.avatarPlaceholder}>
						<Text style={styles.avatarEmoji}>🐰</Text>
					</View>
					<View style={styles.greetingText}>
						<Text style={styles.greeting}>
							Hi, {username.length > 0 ? username : "bạn"}!
						</Text>
						<Text style={styles.greetingSub}>Ngày hôm nay của bạn có ổn không?</Text>
					</View>
				</View>

				{/* Streak widgets */}
				{streaks != null && (
					<View style={styles.streakRow}>
						<StreakCard
							icon="😊"
							count={streaks.smileStreak}
							label="Cười mỗi ngày"
						/>
						<StreakCard
							icon="🔥"
							count={streaks.writingStreak}
							label="Giữ chuỗi bạn nhé"
							isHighlighted
						/>
						{streaks.sadStreak > 0 && (
							<StreakCard
								icon="😢"
								count={streaks.sadStreak}
								label="Buồn rồi, qua nhanh thôi"
							/>
						)}
					</View>
				)}

				{/* Recent entries */}
				<View style={styles.section}>
					<SectionHeader
						title="Nhật ký gần đây"
						action={{ label: "xem thêm", onPress: handleViewAllEntries }}
					/>
					{recentEntries.length === 0 ? (
						<View style={styles.emptyBox}>
							<Text style={styles.emptyText}>Chưa có nhật ký nào. Hãy viết ngay!</Text>
						</View>
					) : (
						recentEntries.map((entry) => (
							<RecentEntryItem
								key={entry.id}
								entry={entry}
								onPress={() => router.push(ROUTES.JOURNAL_DETAIL(entry.id))}
							/>
						))
					)}
				</View>

				{/* Recent playlist */}
				{recentPlaylist != null && tracks.length > 0 && (
					<View style={styles.section}>
						<SectionHeader
							title="Playlist gần đây"
							action={{ label: "xem thêm", onPress: handleViewPlaylist }}
						/>
						{tracks.map(({ track }) => (
							<PlaylistTrackItem key={track.id} track={track} />
						))}
					</View>
				)}
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
		loadingContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
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
		appTitle: {
			fontSize: FONT_SIZE[22],
			fontWeight: "700",
			color: colors.brand.primary,
		},
		greetingRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(12),
			marginBottom: SPACING[20],
		},
		avatarPlaceholder: {
			width: s(52),
			height: s(52),
			borderRadius: s(26),
			backgroundColor: colors.background.elevated,
			alignItems: "center",
			justifyContent: "center",
		},
		avatarEmoji: {
			fontSize: s(28),
		},
		greetingText: {
			flex: 1,
			gap: vs(2),
		},
		greeting: {
			fontSize: FONT_SIZE[18],
			fontWeight: "700",
			color: colors.brand.primary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		greetingSub: {
			fontSize: FONT_SIZE[13],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.normal,
		},
		streakRow: {
			flexDirection: "row",
			gap: s(8),
			marginBottom: SPACING[24],
		},
		section: {
			marginBottom: SPACING[24],
		},
		emptyBox: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.md,
			padding: SPACING[16],
			alignItems: "center",
		},
		emptyText: {
			fontSize: FONT_SIZE[13],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.normal,
		},
	});
}
