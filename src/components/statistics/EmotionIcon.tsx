import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { EMOTION_EMOJI } from "@/constants";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { EmotionType } from "@/types/entry.types";
import { s } from "@/utils";

interface Props {
	emotion: EmotionType | null;
	size?: number;
}

const EMOTION_TO_MOOD_KEY: Record<EmotionType, keyof ThemeColors["mood"]> = {
	Enjoyment: "enjoyment",
	Sadness: "sadness",
	Anger: "anger",
	Fear: "fear",
	Disgust: "disgust",
	Surprise: "surprise",
	Other: "other",
};

export function EmotionIcon({ emotion, size = 36 }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors, size), [colors, size]);

	if (emotion == null) {
		// Days without an entry: subtle empty circle, no emoji
		return <View style={styles.emptyCircle} />;
	}

	const emoji = EMOTION_EMOJI[emotion];
	const borderColor = colors.mood[EMOTION_TO_MOOD_KEY[emotion]];

	return (
		<View style={[styles.circle, { borderColor }]}>
			<Text style={styles.emoji}>{emoji}</Text>
		</View>
	);
}

function createStyles(colors: ThemeColors, size: number) {
	const circleSize = s(size);
	// Scale border width with size — thinner for small calendar icons
	const borderWidth = size >= 30 ? 2 : 1.5;
	return StyleSheet.create({
		circle: {
			width: circleSize,
			height: circleSize,
			borderRadius: circleSize / 2,
			borderWidth,
			backgroundColor: colors.background.card,
			alignItems: "center",
			justifyContent: "center",
		},
		emptyCircle: {
			width: circleSize,
			height: circleSize,
			borderRadius: circleSize / 2,
			borderWidth,
			borderColor: colors.border.subtle,
			// transparent background — blends with parent surface
		},
		emoji: {
			// 0.62 ratio fills the circle well at all sizes
			fontSize: s(size * 0.62),
		},
	});
}
