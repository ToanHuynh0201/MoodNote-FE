// FR-18: Writing patterns by day-of-week and time-of-day

import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { EmotionIcon } from "@/components/statistics/EmotionIcon";
import { SkeletonLoader } from "@/components/ui/feedback";
import { usePatterns, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { DayOfWeekPattern, TimeOfDayPattern } from "@/types/stats.types";
import { s, vs } from "@/utils";

const PERIOD_LABELS: Record<string, string> = {
	morning: "Sáng",
	afternoon: "Chiều",
	evening: "Tối",
	night: "Khuya",
};

export function PatternsSection() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const { data, isLoading, error } = usePatterns({ range: 90 });

	if (isLoading) {
		return (
			<View style={styles.container}>
				<SkeletonLoader width="55%" height={vs(18)} borderRadius={RADIUS.full} />
				<View style={styles.cardGrid}>
					{[0, 1, 2, 3].map((i) => (
						<SkeletonLoader key={i} width="48%" height={vs(72)} borderRadius={RADIUS.md} />
					))}
				</View>
			</View>
		);
	}

	if (error != null || data == null) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Thói quen viết nhật ký</Text>
				<View style={styles.emptyBox}>
					<Text style={styles.emptyText}>{error ?? "Chưa có dữ liệu."}</Text>
				</View>
			</View>
		);
	}

	if (!data.hasEnoughData) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Thói quen viết nhật ký</Text>
				<View style={styles.emptyBox}>
					<Text style={styles.emptyText}>
						Cần thêm dữ liệu để phân tích thói quen. Đã có {data.totalEntries} nhật ký.
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Thói quen viết nhật ký</Text>

			<Text style={styles.subTitle}>Theo ngày trong tuần</Text>
			<FlatList
				data={data.byDayOfWeek}
				keyExtractor={(item) => String(item.dayIndex)}
				renderItem={({ item }) => <DayCard item={item} />}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.horizontalList}
			/>

			<Text style={[styles.subTitle, styles.subTitleSpaced]}>Theo thời điểm trong ngày</Text>
			<FlatList
				data={data.byTimeOfDay}
				keyExtractor={(item) => item.period}
				renderItem={({ item }) => <PeriodCard item={item} />}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.horizontalList}
			/>
		</View>
	);
}

function DayCard({ item }: { item: DayOfWeekPattern }) {
	const colors = useThemeColors();
	const styles = useMemo(() => createCardStyles(colors), [colors]);
	return (
		<View style={styles.card}>
			<Text style={styles.cardLabel}>{item.day}</Text>
			<EmotionIcon emotion={item.dominantEmotion} size={s(22)} />
			<Text style={styles.cardCount}>{item.totalEntries}</Text>
		</View>
	);
}

function PeriodCard({ item }: { item: TimeOfDayPattern }) {
	const colors = useThemeColors();
	const styles = useMemo(() => createCardStyles(colors), [colors]);
	return (
		<View style={styles.card}>
			<Text style={styles.cardLabel}>{PERIOD_LABELS[item.period] ?? item.period}</Text>
			<Text style={styles.cardHours}>{item.hours}</Text>
			<EmotionIcon emotion={item.dominantEmotion} size={s(22)} />
			<Text style={styles.cardCount}>{item.totalEntries}</Text>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			gap: SPACING[12],
		},
		title: {
			fontSize: FONT_SIZE[17],
			fontWeight: "700",
			color: colors.brand.primary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		subTitle: {
			fontSize: FONT_SIZE[13],
			fontWeight: "600",
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.normal,
		},
		subTitleSpaced: {
			marginTop: SPACING[4],
		},
		cardGrid: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: s(8),
		},
		horizontalList: {
			gap: s(8),
		},
		emptyBox: {
			backgroundColor: colors.background.elevated,
			borderRadius: RADIUS.md,
			padding: SPACING[16],
			alignItems: "center",
		},
		emptyText: {
			fontSize: FONT_SIZE[13],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.normal,
			textAlign: "center",
		},
	});
}

function createCardStyles(colors: ThemeColors) {
	return StyleSheet.create({
		card: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.md,
			padding: SPACING[12],
			alignItems: "center",
			gap: vs(4),
			minWidth: s(72),
		},
		cardLabel: {
			fontSize: FONT_SIZE[12],
			fontWeight: "600",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.tight,
		},
		cardHours: {
			fontSize: FONT_SIZE[11],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
		cardCount: {
			fontSize: FONT_SIZE[12],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
