import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ROUTES } from "@/constants";
import { usePlayer, useThemeColors } from "@/hooks";
import { musicService } from "@/services/music.service";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import type { MusicRecommendation } from "@/types/music.types";
import { s, vs } from "@/utils";

interface Props {
	playlist: MusicRecommendation;
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();
	return `${day}/${month}/${year}`;
}

export function RecentPlaylistCard({ playlist }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { playPlaylist } = usePlayer();
	const [isLoadingPlay, setIsLoadingPlay] = useState(false);

	const isMirror = playlist.mode === "MIRROR";
	const badgeBg = isMirror ? colors.brand.surface : colors.status.warningBackground;
	const badgeText = isMirror ? colors.brand.primary : colors.status.warning;

	const handlePress = useCallback(() => {
		router.push(ROUTES.JOURNAL_DETAIL(playlist.entryId));
	}, [playlist.entryId]);

	const handlePlay = useCallback(async () => {
		setIsLoadingPlay(true);
		try {
			const res = await musicService.getByEntry(playlist.entryId);
			if (res.success && res.data?.recommendation) {
				await playPlaylist(
					res.data.recommendation.tracks.map((t) => t.track),
					playlist.entryId,
				);
			}
		} finally {
			setIsLoadingPlay(false);
		}
	}, [playlist.entryId, playPlaylist]);

	return (
		<Pressable style={styles.card} onPress={handlePress}>
			{/* Left icon */}
			<View style={styles.iconBox}>
				<Ionicons name="musical-notes-outline" size={s(20)} color={colors.brand.primary} />
			</View>

			{/* Center info */}
			<View style={styles.info}>
				<Text style={styles.title} numberOfLines={1}>
					{playlist.title ?? "Playlist"}
				</Text>
				<Text style={styles.subtitle} numberOfLines={1}>
					{playlist.tracks.length} bài · {formatDate(playlist.generatedAt)}
				</Text>
			</View>

			{/* Right: mode badge + play + chevron */}
			<View style={styles.right}>
				<View style={[styles.badge, { backgroundColor: badgeBg }]}>
					<Text style={[styles.badgeText, { color: badgeText }]}>{playlist.mode}</Text>
				</View>
				<Pressable
					onPress={(e) => {
						e.stopPropagation();
						void handlePlay();
					}}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel="Phát playlist">
					{isLoadingPlay ? (
						<ActivityIndicator size="small" color={colors.brand.primary} />
					) : (
						<Ionicons name="play-circle-outline" size={s(24)} color={colors.brand.primary} />
					)}
				</Pressable>
				<Ionicons name="chevron-forward" size={s(16)} color={colors.text.muted} />
			</View>
		</Pressable>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		card: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(12),
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.md,
			padding: SPACING[14],
			marginBottom: SPACING[8],
		},
		iconBox: {
			width: s(40),
			height: s(40),
			borderRadius: RADIUS.sm,
			backgroundColor: colors.background.elevated,
			alignItems: "center",
			justifyContent: "center",
		},
		info: {
			flex: 1,
			gap: vs(3),
		},
		title: {
			fontSize: FONT_SIZE[14],
			fontWeight: "600",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.normal,
		},
		subtitle: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
		right: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(6),
		},
		badge: {
			borderRadius: RADIUS.full,
			paddingHorizontal: SPACING[8],
			paddingVertical: vs(2),
		},
		badgeText: {
			fontSize: FONT_SIZE[11],
			fontWeight: "700",
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
