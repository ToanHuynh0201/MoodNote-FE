// FR-06, FR-08: Reusable journal entry card for the list screen

import { useCallback, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { Badge } from "@/components/ui/display/Badge";
import { Card } from "@/components/ui/display/Card";
import { ANALYSIS_STATUS_LABELS } from "@/constants";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { EntryListItem } from "@/types/entry.types";
import { formatDateWithWeekday, s, vs } from "@/utils";

interface Props {
	entry: EntryListItem;
	onPress: () => void;
}

export function EntryCard({ entry, onPress }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	// Subtle press scale feedback
	const scale = useSharedValue(1);
	const pressStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = useCallback(() => {
		scale.value = withSpring(0.97, { damping: 20, stiffness: 400, mass: 0.8 });
	}, [scale]);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, { damping: 15, stiffness: 300 });
	}, [scale]);

	const statusColor = useMemo(() => {
		switch (entry.analysisStatus) {
			case "PROCESSING":
				return colors.status.info;
			case "COMPLETED":
				return colors.status.success;
			case "FAILED":
				return colors.status.error;
			default:
				return colors.text.muted;
		}
	}, [entry.analysisStatus, colors]);

	return (
		<Pressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			accessibilityRole="button"
			accessibilityLabel={entry.title ?? "Nhật ký"}>
			<Animated.View style={pressStyle}>
				<Card variant="elevated" padding={SPACING[16]}>
					{/* Header row: date + word count */}
					<View style={styles.headerRow}>
						<Text style={styles.date}>{formatDateWithWeekday(entry.entryDate)}</Text>
						<Badge
							label={`${entry.wordCount} từ`}
							size="sm"
							color={colors.background.elevated}
							textColor={colors.text.muted}
						/>
					</View>

					{/* Title */}
					{entry.title != null && entry.title.length > 0 && (
						<Text style={styles.title} numberOfLines={1}>
							{entry.title}
						</Text>
					)}

					{/* Preview */}
					<Text style={styles.preview} numberOfLines={2}>
						{entry.preview}
					</Text>

					{/* Tags */}
					{((entry.moodTags?.length ?? 0) > 0 || (entry.lifeTags?.length ?? 0) > 0) && (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.tagsScroll}
							contentContainerStyle={styles.tagsContent}>
							{[...(entry.moodTags ?? []), ...(entry.lifeTags ?? [])].map((tag) => (
								<Badge key={tag.id} label={`#${tag.name}`} size="sm" />
							))}
						</ScrollView>
					)}

					{/* Analysis status */}
					<View style={styles.statusRow}>
						<View style={styles.analysisBadge}>
							<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
							<Text style={[styles.statusText, { color: statusColor }]}>
								{ANALYSIS_STATUS_LABELS[entry.analysisStatus] ?? entry.analysisStatus}
							</Text>
						</View>
					</View>
				</Card>
			</Animated.View>
		</Pressable>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		headerRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: SPACING[8],
		},
		date: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
		title: {
			fontSize: FONT_SIZE[15],
			fontWeight: "600",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.normal,
			marginBottom: SPACING[4],
		},
		preview: {
			fontSize: FONT_SIZE[13],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		tagsScroll: {
			marginTop: SPACING[8],
		},
		tagsContent: {
			gap: s(6),
		},
		statusRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginTop: SPACING[8],
		},
		analysisBadge: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(4),
		},
		statusDot: {
			width: s(6),
			height: vs(6),
			borderRadius: RADIUS.full,
		},
		statusText: {
			fontSize: FONT_SIZE[11],
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
