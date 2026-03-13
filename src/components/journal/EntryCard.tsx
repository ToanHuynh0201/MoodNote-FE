// FR-06, FR-08: Reusable journal entry card for the list screen

import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { EntryListItem } from "@/types/entry.types";
import { s, vs } from "@/utils";
import { Badge } from "../ui/display/Badge";
import { Card } from "../ui/display/Card";

interface Props {
	entry: EntryListItem;
	onPress: () => void;
}

const ANALYSIS_STATUS_LABELS: Record<string, string> = {
	PENDING: "Chờ phân tích",
	PROCESSING: "Đang phân tích",
	COMPLETED: "Đã phân tích",
	FAILED: "Phân tích lỗi",
};

function formatEntryDate(isoDate: string): string {
	const date = new Date(isoDate);
	return date.toLocaleDateString("vi-VN", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export function EntryCard({ entry, onPress }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

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
		<Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={entry.title ?? "Nhật ký"}>
			<Card variant="elevated" padding={SPACING[16]}>
				{/* Header row: date + word count */}
				<View style={styles.headerRow}>
					<Text style={styles.date}>{formatEntryDate(entry.entryDate)}</Text>
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
				{entry.tags.length > 0 && (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.tagsScroll}
						contentContainerStyle={styles.tagsContent}>
						{entry.tags.map((tag) => (
							<Badge key={tag} label={`#${tag}`} size="sm" />
						))}
					</ScrollView>
				)}

				{/* Analysis status */}
				<View style={styles.statusRow}>
					<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
					<Text style={[styles.statusText, { color: statusColor }]}>
						{ANALYSIS_STATUS_LABELS[entry.analysisStatus] ?? entry.analysisStatus}
					</Text>
				</View>
			</Card>
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
			alignItems: "center",
			gap: s(4),
			marginTop: SPACING[8],
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
