// FR-18: Emotion sentiment chart with range selector

import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { CartesianChart, Line } from "victory-native";

import { useEmotionChart, useThemeColors } from "@/hooks";
import { SkeletonLoader } from "@/components/ui/feedback";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";

type ChartRange = 7 | 14 | 30 | 90;

const RANGES: { label: string; value: ChartRange }[] = [
	{ label: "7N", value: 7 },
	{ label: "14N", value: 14 },
	{ label: "30N", value: 30 },
	{ label: "90N", value: 90 },
];

const TREND_LABELS: Record<string, string> = {
	up: "↑ Tích cực hơn",
	down: "↓ Tiêu cực hơn",
	stable: "→ Ổn định",
};

const TREND_COLOR_KEY: Record<string, "success" | "error" | "muted"> = {
	up: "success",
	down: "error",
	stable: "muted",
};

type ChartDatum = { index: number; score: number };

export function EmotionChartSection() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { width: screenWidth } = useWindowDimensions();
	const chartWidth = screenWidth - SPACING[16] * 2 - SPACING[32];

	const { data, range, isLoading, error, setRange } = useEmotionChart(30);

	const handleRangePress = useCallback(
		(value: ChartRange) => {
			setRange(value);
		},
		[setRange],
	);

	const chartData = useMemo<ChartDatum[]>(() => {
		if (!data) return [];
		return data.dataPoints.map((p, i) => ({ index: i, score: p.sentimentScore }));
	}, [data]);

	if (isLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<SkeletonLoader width="60%" height={vs(18)} borderRadius={RADIUS.full} />
					<SkeletonLoader width={s(120)} height={vs(28)} borderRadius={RADIUS.full} />
				</View>
				<SkeletonLoader width="100%" height={vs(160)} borderRadius={RADIUS.md} style={styles.chartSkeleton} />
			</View>
		);
	}

	if (error != null || data == null) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Xu hướng cảm xúc</Text>
				<View style={styles.emptyBox}>
					<Text style={styles.emptyText}>{error ?? "Chưa có dữ liệu."}</Text>
				</View>
			</View>
		);
	}

	const trendColor =
		TREND_COLOR_KEY[data.summary.trend] === "success"
			? colors.status.success
			: TREND_COLOR_KEY[data.summary.trend] === "error"
				? colors.status.error
				: colors.text.muted;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Xu hướng cảm xúc</Text>
				<View style={styles.rangeSelector}>
					{RANGES.map(({ label, value }) => (
						<Pressable
							key={value}
							onPress={() => handleRangePress(value)}
							style={[styles.rangeBtn, range === value && styles.rangeBtnActive]}
							accessibilityRole="button"
							accessibilityLabel={`${value} ngày`}>
							<Text style={[styles.rangeBtnText, range === value && styles.rangeBtnTextActive]}>
								{label}
							</Text>
						</Pressable>
					))}
				</View>
			</View>

			{/* Summary row */}
			<View style={styles.summaryRow}>
				{data.summary.averageSentiment != null && (
					<View style={styles.summaryChip}>
						<Text style={styles.summaryChipText}>
							TB: {data.summary.averageSentiment.toFixed(2)}
						</Text>
					</View>
				)}
				<View style={[styles.summaryChip, { borderColor: trendColor }]}>
					<Text style={[styles.summaryChipText, { color: trendColor }]}>
						{TREND_LABELS[data.summary.trend] ?? data.summary.trend}
					</Text>
				</View>
				<Text style={styles.entryCount}>{data.summary.totalEntries} nhật ký</Text>
			</View>

			{/* Chart */}
			{chartData.length > 1 ? (
				<View style={{ height: vs(160), width: chartWidth }}>
					<CartesianChart
						data={chartData}
						xKey="index"
						yKeys={["score"]}
						domain={{ y: [-1.2, 1.2] }}
						domainPadding={{ left: SPACING[8], right: SPACING[8] }}>
						{({ points }) => (
							<Line
								points={points.score}
								color={colors.brand.primary}
								strokeWidth={s(2)}
								curveType="natural"
								animate={{ type: "timing", duration: 600 }}
							/>
						)}
					</CartesianChart>
				</View>
			) : (
				<View style={styles.emptyBox}>
					<Text style={styles.emptyText}>Cần ít nhất 2 nhật ký để hiển thị biểu đồ.</Text>
				</View>
			)}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			gap: SPACING[12],
		},
		header: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		title: {
			fontSize: FONT_SIZE[17],
			fontWeight: "700",
			color: colors.brand.primary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		rangeSelector: {
			flexDirection: "row",
			gap: s(4),
		},
		rangeBtn: {
			paddingHorizontal: SPACING[8],
			paddingVertical: SPACING[4],
			borderRadius: RADIUS.sm,
			backgroundColor: colors.background.elevated,
		},
		rangeBtnActive: {
			backgroundColor: colors.brand.primary,
		},
		rangeBtnText: {
			fontSize: FONT_SIZE[12],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.tight,
		},
		rangeBtnTextActive: {
			color: colors.text.inverse,
			fontWeight: "600",
		},
		summaryRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(8),
			flexWrap: "wrap",
		},
		summaryChip: {
			borderWidth: 1,
			borderColor: colors.border.default,
			borderRadius: RADIUS.full,
			paddingHorizontal: SPACING[8],
			paddingVertical: SPACING[2],
		},
		summaryChipText: {
			fontSize: FONT_SIZE[12],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.tight,
		},
		entryCount: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
			marginLeft: "auto",
		},
		chartSkeleton: {
			marginTop: SPACING[4],
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
