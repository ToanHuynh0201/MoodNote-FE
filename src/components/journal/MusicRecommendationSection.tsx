// FR-11: Music recommendation section on journal detail screen

import { useCallback, useMemo, useState } from "react";
import {
	LayoutAnimation,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	UIManager,
	View,
} from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeOut,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { PlaylistTrackItem } from "@/components/home/PlaylistTrackItem";
import { SkeletonLoader } from "@/components/ui/feedback";
import { useEntryRecommendation, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { MusicStatus } from "@/types/entry.types";
import { s, vs } from "@/utils";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
	entryId: string;
	musicStatus: MusicStatus;
}

const MODE_LABELS: Record<string, string> = {
	MIRROR: "Mirror mode",
	SHIFT: "Shift mode",
};

const STAGE_LABELS: Record<1 | 2 | 3, string> = {
	1: "Match",
	2: "Chuyển tiếp",
	3: "Mục tiêu",
};

export function MusicRecommendationSection({ entryId, musicStatus }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const { recommendation, isLoading, isPolling, error, refresh } = useEntryRecommendation(
		entryId,
		musicStatus,
	);

	const handleRefresh = useCallback(() => {
		void refresh();
	}, [refresh]);

	const [isExpanded, setIsExpanded] = useState(false);
	const expandProgress = useSharedValue(0);

	const toggleExpanded = useCallback(() => {
		LayoutAnimation.configureNext({
			duration: 280,
			update: { type: LayoutAnimation.Types.easeInEaseOut },
		});
		const toValue = isExpanded ? 0 : 1;
		expandProgress.value = withTiming(toValue, {
			duration: 280,
			easing: Easing.out(Easing.cubic),
		});
		setIsExpanded((prev) => !prev);
	}, [isExpanded, expandProgress]);

	const chevronAnimStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${interpolate(expandProgress.value, [0, 1], [0, 180])}deg` }],
	}));

	if (
		recommendation == null &&
		!isLoading &&
		!isPolling &&
		error == null &&
		musicStatus !== "FAILED"
	) {
		return null;
	}

	let contentBody: React.ReactNode;
	if (musicStatus === "FAILED") {
		contentBody = (
			<View style={styles.emptyState}>
				<Text style={styles.emptyText}>Không thể tạo gợi ý nhạc.</Text>
				<Pressable
					onPress={handleRefresh}
					style={styles.retryBtn}
					accessibilityRole="button"
					accessibilityLabel="Thử lại">
					<Text style={styles.retryText}>Thử lại</Text>
				</Pressable>
			</View>
		);
	} else if (isLoading || isPolling) {
		contentBody = (
			<View style={styles.skeletonList}>
				{[0, 1, 2, 3, 4].map((i) => (
					<View key={i} style={styles.skeletonRow}>
						<SkeletonLoader width={s(52)} height={vs(52)} borderRadius={RADIUS.sm} />
						<View style={styles.skeletonInfo}>
							<SkeletonLoader width="70%" height={vs(14)} borderRadius={RADIUS.full} />
							<SkeletonLoader width="45%" height={vs(12)} borderRadius={RADIUS.full} />
						</View>
					</View>
				))}
			</View>
		);
	} else if (error != null) {
		contentBody = (
			<View style={styles.emptyState}>
				<Text style={styles.emptyText}>{error}</Text>
				<Pressable
					onPress={handleRefresh}
					style={styles.retryBtn}
					accessibilityRole="button"
					accessibilityLabel="Thử lại">
					<Text style={styles.retryText}>Thử lại</Text>
				</Pressable>
			</View>
		);
	} else if (recommendation != null) {
		if (recommendation.mode === "SHIFT") {
			const groups: Array<{ stage: 1 | 2 | 3; items: typeof recommendation.tracks }> = [
				{ stage: 1, items: recommendation.tracks.filter((t) => t.stage === 1) },
				{ stage: 2, items: recommendation.tracks.filter((t) => t.stage === 2) },
				{ stage: 3, items: recommendation.tracks.filter((t) => t.stage === 3) },
			].filter((g) => g.items.length > 0);

			contentBody = (
				<View>
					{groups.map((group) => (
						<View key={group.stage}>
							<Text style={styles.stageHeader}>{STAGE_LABELS[group.stage]}</Text>
							{group.items.map((item) => (
								<PlaylistTrackItem
									key={String(item.order)}
									order={item.order}
									track={item.track}
									score={item.score}
								/>
							))}
						</View>
					))}
				</View>
			);
		} else {
			contentBody = (
				<View>
					{recommendation.tracks.map((item) => (
						<PlaylistTrackItem
							key={String(item.order)}
							order={item.order}
							track={item.track}
							score={item.score}
						/>
					))}
				</View>
			);
		}
	}

	return (
		<View style={styles.container}>
			<Pressable
				style={styles.header}
				onPress={toggleExpanded}
				accessibilityRole="button"
				accessibilityLabel={isExpanded ? "Ẩn nhạc gợi ý" : "Xem nhạc gợi ý"}
				accessibilityState={{ expanded: isExpanded }}>
				<Text style={styles.heading}>Nhạc gợi ý</Text>
				<View style={styles.headerRight}>
					{recommendation != null && (
						<>
							<View style={styles.modeBadge}>
								<Text style={styles.modeText}>
									{MODE_LABELS[recommendation.mode] ?? recommendation.mode}
								</Text>
							</View>
							{recommendation.diagnostics?.moodKey != null && (
								<View style={styles.modeBadge}>
									<Text style={styles.modeText}>{recommendation.diagnostics.moodKey}</Text>
								</View>
							)}
							<Pressable
								onPress={handleRefresh}
								hitSlop={8}
								accessibilityRole="button"
								accessibilityLabel="Làm mới gợi ý nhạc">
								<Text style={styles.refreshText}>Làm mới</Text>
							</Pressable>
						</>
					)}
					<Animated.View style={chevronAnimStyle}>
						<Ionicons name="chevron-down" size={s(16)} color={colors.text.secondary} />
					</Animated.View>
				</View>
			</Pressable>

			{isExpanded && (
				<Animated.View
					entering={FadeIn.duration(220).easing(Easing.out(Easing.cubic))}
					exiting={FadeOut.duration(150)}
					style={styles.contentInner}>
					{contentBody}
				</Animated.View>
			)}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			padding: SPACING[16],
			marginTop: SPACING[12],
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		heading: {
			fontSize: FONT_SIZE[15],
			fontWeight: "600",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.normal,
		},
		headerRight: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(8),
		},
		modeBadge: {
			backgroundColor: colors.brand.surface,
			borderRadius: RADIUS.full,
			paddingHorizontal: SPACING[8],
			paddingVertical: SPACING[2],
		},
		modeText: {
			fontSize: FONT_SIZE[11],
			color: colors.brand.primary,
			lineHeight: LINE_HEIGHT.tight,
		},
		refreshText: {
			fontSize: FONT_SIZE[13],
			color: colors.text.link,
			lineHeight: LINE_HEIGHT.normal,
		},
		contentInner: {
			paddingTop: SPACING[8],
		},
		skeletonList: {
			gap: vs(12),
		},
		skeletonRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(12),
		},
		skeletonInfo: {
			flex: 1,
			gap: vs(6),
		},
		emptyState: {
			alignItems: "center",
			paddingVertical: SPACING[16],
			gap: vs(8),
		},
		emptyText: {
			fontSize: FONT_SIZE[13],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.normal,
			textAlign: "center",
		},
		retryBtn: {
			paddingHorizontal: SPACING[16],
			paddingVertical: SPACING[8],
			backgroundColor: colors.background.elevated,
			borderRadius: RADIUS.md,
		},
		retryText: {
			fontSize: FONT_SIZE[13],
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.normal,
		},
		stageHeader: {
			fontSize: FONT_SIZE[11],
			fontWeight: "600",
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
			marginTop: SPACING[10],
			marginBottom: SPACING[4],
			textTransform: "uppercase",
		},
	});
}
