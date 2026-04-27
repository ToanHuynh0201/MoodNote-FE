import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import type { Track } from "@/types/music.types";
import { s, vs } from "@/utils";
import { Ionicons } from "@expo/vector-icons";

interface Props {
	track: Track;
	order: number;
	score?: number | null;
}

type ChipVariant = "info" | "warning" | "success" | "brand";

interface FeatureChip {
	label: string;
	value: string;
	icon: keyof typeof Ionicons.glyphMap;
	variant: ChipVariant;
}

const EXPAND_DURATION = 300;
const PANEL_MAX_HEIGHT = 300;

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function PlaylistTrackItem({ track, order, score }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const [expanded, setExpanded] = useState(false);

	const progress = useSharedValue(0);

	const panelAnimStyle = useAnimatedStyle(() => ({
		maxHeight: progress.value * PANEL_MAX_HEIGHT,
		opacity: progress.value,
	}));

	const chevronAnimStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${progress.value * 180}deg` }],
	}));

	const artistNames = track.artists.map((a) => a.name).join(" x ");

	const metaLine = useMemo(() => {
		const parts: string[] = [];
		if (track.albumName != null) parts.push(track.albumName);
		if (track.durationMs != null) parts.push(formatDuration(track.durationMs));
		if (score != null) parts.push(score.toFixed(3));
		return parts.length > 0 ? parts.join(" · ") : null;
	}, [track.albumName, track.durationMs, score]);

	const chips: FeatureChip[] = useMemo(() => {
		const result: FeatureChip[] = [];
		if (track.tempo != null)
			result.push({ label: "Tempo", value: `${Math.round(track.tempo)} BPM`, icon: "speedometer-outline", variant: "info" });
		if (track.energy != null)
			result.push({ label: "Energy", value: `${Math.round(track.energy * 100)}%`, icon: "flash-outline", variant: "warning" });
		if (track.valence != null)
			result.push({ label: "Valence", value: `${Math.round(track.valence * 100)}%`, icon: "heart-outline", variant: "success" });
		if (track.danceability != null)
			result.push({ label: "Dance", value: `${Math.round(track.danceability * 100)}%`, icon: "musical-note-outline", variant: "brand" });
		if (track.acousticness != null)
			result.push({ label: "Acoustic", value: `${Math.round(track.acousticness * 100)}%`, icon: "mic-outline", variant: "info" });
		if (track.popularity != null)
			result.push({ label: "Popular", value: `${Math.round(track.popularity)}/100`, icon: "star-outline", variant: "warning" });
		return result;
	}, [track]);

	const chipBg: Record<ChipVariant, string> = {
		info: colors.status.infoBackground,
		warning: colors.status.warningBackground,
		success: colors.status.successBackground,
		brand: colors.brand.surface,
	};
	const chipAccent: Record<ChipVariant, string> = {
		info: colors.status.info,
		warning: colors.status.warning,
		success: colors.status.success,
		brand: colors.brand.primary,
	};

	function handlePress() {
		const next = !expanded;
		setExpanded(next);
		progress.value = withTiming(next ? 1 : 0, {
			duration: EXPAND_DURATION,
			easing: Easing.out(Easing.cubic),
		});
	}

	return (
		<View style={styles.wrapper}>
			<Pressable onPress={handlePress} style={styles.container}>
				{/* Track order number */}
				<View style={styles.orderBadge}>
					<Text style={styles.orderText}>{String(order).padStart(2, "0")}</Text>
				</View>

				{/* Track info */}
				<View style={styles.info}>
					<Text style={styles.trackName} numberOfLines={1}>
						{track.trackName}
					</Text>
					<Text style={styles.artists} numberOfLines={1}>
						{artistNames}
					</Text>
					{metaLine != null && (
						<Text style={styles.meta} numberOfLines={1}>
							{metaLine}
						</Text>
					)}
				</View>

				{/* Actions */}
				<View style={styles.actions}>
					<Ionicons name="heart-outline" size={s(18)} color={colors.text.muted} />
					<Ionicons name="share-outline" size={s(18)} color={colors.text.muted} />
					<View style={styles.playBtn}>
						<Ionicons name="play" size={s(14)} color={colors.text.inverse} />
					</View>
					<Animated.View style={chevronAnimStyle}>
						<Ionicons name="chevron-down" size={s(16)} color={colors.text.muted} />
					</Animated.View>
				</View>
			</Pressable>

			{/* Expandable panel — always mounted, animated in/out */}
			<Animated.View style={[styles.panelWrapper, panelAnimStyle]}>
				<View style={styles.panel}>
					<View style={styles.chips}>
						{chips.map((chip) => (
							<View
								key={chip.label}
								style={[styles.chip, { backgroundColor: chipBg[chip.variant], borderColor: chipAccent[chip.variant] }]}
							>
								<Ionicons name={chip.icon} size={s(13)} color={chipAccent[chip.variant]} />
								<Text style={styles.chipLabel}>{chip.label}</Text>
								<Text style={[styles.chipValue, { color: chipAccent[chip.variant] }]}>
									{chip.value}
								</Text>
							</View>
						))}
					</View>
				</View>
			</Animated.View>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		wrapper: {
			borderBottomWidth: 1,
			borderBottomColor: colors.border.subtle,
		},
		container: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(12),
			paddingVertical: SPACING[10],
		},
		orderBadge: {
			width: s(28),
			alignItems: "center",
		},
		orderText: {
			fontSize: FONT_SIZE[14],
			fontWeight: "700",
			color: colors.brand.primary,
			lineHeight: LINE_HEIGHT.normal,
		},
		info: {
			flex: 1,
			gap: vs(2),
		},
		trackName: {
			fontSize: FONT_SIZE[14],
			fontWeight: "600",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.normal,
		},
		artists: {
			fontSize: FONT_SIZE[12],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.tight,
		},
		meta: {
			fontSize: FONT_SIZE[11],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
			fontStyle: "italic",
		},
		actions: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(10),
		},
		playBtn: {
			width: s(32),
			height: s(32),
			borderRadius: RADIUS.full,
			backgroundColor: colors.brand.primary,
			alignItems: "center",
			justifyContent: "center",
		},
		panelWrapper: {
			overflow: "hidden",
		},
		panel: {
			backgroundColor: colors.background.elevated,
			borderRadius: RADIUS.md,
			marginBottom: SPACING[10],
			padding: SPACING[12],
			gap: vs(10),
		},
		chips: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: s(6),
		},
		chip: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(5),
			borderRadius: RADIUS.full,
			borderWidth: 1,
			paddingHorizontal: SPACING[10],
			paddingVertical: SPACING[8],
		},
		chipLabel: {
			fontSize: FONT_SIZE[11],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.tight,
		},
		chipValue: {
			fontSize: FONT_SIZE[11],
			fontWeight: "700",
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
