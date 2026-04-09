import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartesianChart, Line, useAreaPath, type ChartBounds, type PointsArray } from "victory-native";
import { LinearGradient, Path, vec } from "@shopify/react-native-skia";

import { EMOTION_EMOJI } from "@/constants";
import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import type { EmotionType } from "@/types/entry.types";
import type { WeeklyDay } from "@/types/stats.types";
import { s, vs } from "@/utils";

interface Props {
	days: WeeklyDay[];
	width: number;
	height?: number;
}

type ChartDatum = {
	dayIndex: number;
	refScore: number;
	mainScore: number | null;
};

/** Map abbreviated label to full Vietnamese form for chart X-axis */
const DAY_FULL_LABEL: Record<string, string> = {
	T2: "Thứ 2",
	T3: "Thứ 3",
	T4: "Thứ 4",
	T5: "Thứ 5",
	T6: "Thứ 6",
	T7: "Thứ 7",
	CN: "CN",
};

/** Sentiment domain bounds — extra padding for visual breathing room */
const DOMAIN_MIN = -1.2;
const DOMAIN_MAX = 1.2;
const DOMAIN_RANGE = DOMAIN_MAX - DOMAIN_MIN;

interface GradientAreaProps {
	points: PointsArray;
	y0: number;
	startColor: string;
	endColor: string;
	chartBounds: ChartBounds;
}

/**
 * Renders a gradient-filled area below the given line path.
 * Must be a separate React component so hooks (useAreaPath) can run inside
 * the Skia Canvas render context of CartesianChart.
 */
function GradientArea({ points, y0, startColor, endColor, chartBounds }: GradientAreaProps) {
	const { path } = useAreaPath(points, y0, { curveType: "natural", connectMissingData: false });
	return (
		<Path path={path} style="fill">
			<LinearGradient
				start={vec(0, chartBounds.top)}
				end={vec(0, y0)}
				colors={[startColor, endColor]}
			/>
		</Path>
	);
}

export function SentimentLineChart({ days, width, height = vs(180) }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	/** Capture chartBounds from CartesianChart to compute emoji pixel positions */
	const [chartBounds, setChartBounds] = useState<ChartBounds | null>(null);

	/** Build the unified data array for CartesianChart */
	const chartData = useMemo<ChartDatum[]>(() => {
		return days.map((day, i) => ({
			dayIndex: i,
			refScore: day.hasEntry && day.sentimentScore != null ? day.sentimentScore : 0,
			mainScore: day.hasEntry && day.sentimentScore != null ? day.sentimentScore : null,
		}));
	}, [days]);

	/**
	 * Compute absolute pixel positions for emoji overlays.
	 * chartBounds gives us the pixel extent of the data domain.
	 */
	const emojiPositions = useMemo<
		{ x: number; y: number; emotion: EmotionType; date: string }[]
	>(() => {
		if (!chartBounds) return [];
		const chartW = chartBounds.right - chartBounds.left;
		const chartH = chartBounds.bottom - chartBounds.top;
		return days
			.map((day, i) => {
				if (!day.hasEntry || day.sentimentScore == null || !day.emotion) return null;
				const x = chartBounds.left + (i / 6) * chartW;
				const y = chartBounds.top + ((DOMAIN_MAX - day.sentimentScore) / DOMAIN_RANGE) * chartH;
				return { x, y, emotion: day.emotion, date: day.date };
			})
			.filter(
				(p): p is { x: number; y: number; emotion: EmotionType; date: string } => p !== null,
			);
	}, [chartBounds, days]);

	const brandColor = colors.brand.primary;
	/** Hex colors with alpha for Skia LinearGradient */
	const gradientStart = `${brandColor}4D`; // ~30% opacity
	const gradientEnd = `${brandColor}00`; // 0% opacity

	return (
		<View>
			{/* Chart canvas — wrapper View gives CartesianChart explicit dimensions */}
			<View style={{ height, width }}>
				<CartesianChart
					data={chartData}
					xKey="dayIndex"
					yKeys={["refScore", "mainScore"]}
					domain={{ y: [DOMAIN_MIN, DOMAIN_MAX] }}
					domainPadding={{ left: SPACING[16], right: SPACING[16] }}
					onChartBoundsChange={setChartBounds}>
					{({ points, chartBounds: bounds }) => (
						<>
							{/* Gray reference curve — all 7 days, 0 for missing */}
							<Line
								points={points.refScore}
								color={colors.border.subtle}
								strokeWidth={s(2)}
								curveType="natural"
								opacity={0.55}
							/>

							{/* Gradient area fill beneath the main entry curve */}
							<GradientArea
								points={points.mainScore}
								y0={bounds.bottom}
								startColor={gradientStart}
								endColor={gradientEnd}
								chartBounds={bounds}
							/>

							{/* Main entry curve — animated, breaks at null (missing days) */}
							<Line
								points={points.mainScore}
								color={brandColor}
								strokeWidth={s(3)}
								curveType="natural"
								animate={{ type: "timing", duration: 800 }}
							/>
						</>
					)}
				</CartesianChart>

				{/* Emoji overlays — React Native elements positioned over the Skia canvas */}
				{emojiPositions.map((p) => {
					const emoji = EMOTION_EMOJI[p.emotion];
					const emojiSize = s(28);
					return (
						<View
							key={p.date}
							style={[
								styles.emojiOverlay,
								{
									left: p.x - emojiSize / 2,
									top: p.y - emojiSize - vs(4),
								},
							]}
							pointerEvents="none">
							<Text style={styles.emojiText}>{emoji}</Text>
						</View>
					);
				})}
			</View>

			{/* Day labels row */}
			<View style={[styles.labelsRow, { paddingHorizontal: SPACING[16] }]}>
				{days.map((day) => (
					<View key={day.date} style={styles.labelCell}>
						<Text style={styles.dayLabel} numberOfLines={1} adjustsFontSizeToFit>
							{DAY_FULL_LABEL[day.dayLabel] ?? day.dayLabel}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		emojiOverlay: {
			position: "absolute",
		},
		emojiText: {
			fontSize: s(26),
		},
		labelsRow: {
			flexDirection: "row",
			marginTop: vs(6),
		},
		labelCell: {
			flex: 1,
			alignItems: "center",
		},
		dayLabel: {
			fontSize: FONT_SIZE[11],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
