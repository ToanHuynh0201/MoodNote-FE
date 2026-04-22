import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import type { TrackSimple } from "@/types/music.types";
import { s, vs } from "@/utils";
import { Ionicons } from "@expo/vector-icons";

interface Props {
	track: TrackSimple;
}

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function PlaylistTrackItem({ track }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const artistNames = track.artists.map((a) => a.name).join(" x ");

	return (
		<View style={styles.container}>
			{/* Album thumbnail */}
			<View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
				<Ionicons name="musical-notes" size={s(20)} color={colors.text.muted} />
			</View>

			{/* Track info */}
			<View style={styles.info}>
				<Text style={styles.trackName} numberOfLines={1}>
					{track.trackName}
				</Text>
				<Text style={styles.artists} numberOfLines={1}>
					{artistNames}
				</Text>
			</View>

			{/* Actions */}
			<View style={styles.actions}>
				<Ionicons name="heart-outline" size={s(18)} color={colors.text.muted} />
				<Ionicons name="information-circle-outline" size={s(18)} color={colors.text.muted} />
				<Ionicons name="share-outline" size={s(18)} color={colors.text.muted} />
				<View style={styles.playBtn}>
					<Ionicons name="play" size={s(14)} color={colors.text.inverse} />
				</View>
			</View>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(12),
			paddingVertical: SPACING[10],
			borderBottomWidth: 1,
			borderBottomColor: colors.border.subtle,
		},
		thumbnail: {
			width: s(52),
			height: vs(52),
			borderRadius: RADIUS.sm,
		},
		thumbnailPlaceholder: {
			backgroundColor: colors.background.elevated,
			alignItems: "center",
			justifyContent: "center",
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
	});
}
