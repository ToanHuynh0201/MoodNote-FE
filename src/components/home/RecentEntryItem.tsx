import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EMOTION_EMOJI } from "@/constants";
import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import type { EntryListItem } from "@/types/entry.types";
import { formatShortDate, formatTime, s, vs } from "@/utils";

interface Props {
	entry: EntryListItem;
	onPress: () => void;
}

export function RecentEntryItem({ entry, onPress }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const title = entry.title && entry.title.length > 0
		? entry.title
		: `Nhật ký ngày ${formatShortDate(entry.entryDate)}`;

	const emotionEmoji =
		entry.emotionAnalysis != null ? EMOTION_EMOJI[entry.emotionAnalysis.primaryEmotion] : null;

	const handlePress = useCallback(() => {
		onPress();
	}, [onPress]);

	return (
		<Pressable
			onPress={handlePress}
			accessibilityRole="button"
			accessibilityLabel={title}
			style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title} numberOfLines={1}>
					{title}
				</Text>
				<Text style={styles.preview} numberOfLines={2}>
					{entry.preview}
				</Text>
			</View>
			<View style={styles.meta}>
				{emotionEmoji != null && (
					<Text style={styles.emotion}>{emotionEmoji}</Text>
				)}
				<View style={styles.timeContainer}>
					<Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
					<Text style={styles.date}>{formatShortDate(entry.entryDate)}</Text>
				</View>
			</View>
		</Pressable>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "flex-start",
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.md,
			padding: SPACING[14],
			marginBottom: SPACING[8],
			gap: s(8),
		},
		content: {
			flex: 1,
			gap: vs(4),
		},
		title: {
			fontSize: FONT_SIZE[14],
			fontWeight: "600",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.normal,
		},
		preview: {
			fontSize: FONT_SIZE[12],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		meta: {
			alignItems: "flex-end",
			gap: vs(4),
		},
		emotion: {
			fontSize: s(18),
		},
		timeContainer: {
			alignItems: "flex-end",
		},
		time: {
			fontSize: FONT_SIZE[11],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
		date: {
			fontSize: FONT_SIZE[11],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
