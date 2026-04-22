// FR-18, FR-20: Statistics (Báo cáo) screen — weekly chart + monthly calendar

import { useCallback, useMemo } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from "react-native";

import { ScreenWrapper } from "@/components";
import { CalendarSkeleton, EmotionChartSection, KeywordsSection, MonthlyCalendar, PatternsSection, SentimentLineChart, WeeklyOverview, WeeklySectionSkeleton } from "@/components/statistics";
import { useStatistics, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";
import { Ionicons } from "@expo/vector-icons";

export default function StatisticsScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { width: screenWidth } = useWindowDimensions();

	const {
		weeklyData,
		calendarData,
		isLoadingWeekly,
		isLoadingCalendar,
		goToPrevWeek,
		goToNextWeek,
		isNextWeekDisabled,
		calendarYear,
		calendarMonth,
		setCalendarMonth,
	} = useStatistics();

	const chartWidth = screenWidth - SPACING[16] * 2;

	const handleChangeMonth = useCallback(
		(year: number, month: number) => {
			setCalendarMonth(year, month);
		},
		[setCalendarMonth],
	);

	return (
		<ScreenWrapper padded={false} style={styles.container}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}>
				{/* Screen title */}
				<Text style={styles.screenTitle}>Báo cáo</Text>

				{/* ── Weekly section ── */}
				<View style={styles.section}>
					<View style={styles.weeklyHeader}>
						<View>
							<Text style={styles.sectionTitle}>Cảm xúc theo tuần</Text>
							{weeklyData != null && <Text style={styles.weekLabel}>{weeklyData.weekLabel}</Text>}
						</View>
						<View style={styles.weekNav}>
							<Pressable
								onPress={goToPrevWeek}
								hitSlop={8}
								accessibilityRole="button"
								accessibilityLabel="Tuần trước">
								<Ionicons name="chevron-back" size={s(20)} color={colors.brand.primary} />
							</Pressable>
							<Pressable
								onPress={goToNextWeek}
								hitSlop={8}
								disabled={isNextWeekDisabled}
								accessibilityRole="button"
								accessibilityLabel="Tuần sau">
								<Ionicons
									name="chevron-forward"
									size={s(20)}
									color={isNextWeekDisabled ? colors.interactive.disabled : colors.brand.primary}
								/>
							</Pressable>
						</View>
					</View>

					{isLoadingWeekly ? (
						<WeeklySectionSkeleton />
					) : weeklyData != null ? (
						<>
							{/* Line chart — no card background, floats on gradient */}
							<View style={styles.chartContainer}>
								<SentimentLineChart days={weeklyData.days} width={chartWidth} height={vs(180)} />
							</View>

							{/* 7-day overview */}
							<Text style={styles.overviewLabel}>Tổng quan</Text>
							<WeeklyOverview days={weeklyData.days} />
						</>
					) : (
						<View style={styles.emptyBox}>
							<Text style={styles.emptyText}>Chưa có dữ liệu tuần này.</Text>
						</View>
					)}
				</View>

				{/* ── Monthly section ── */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Cảm xúc theo tháng</Text>

					{isLoadingCalendar ? (
						<CalendarSkeleton />
					) : calendarData != null ? (
						<View style={styles.calendarContainer}>
							<MonthlyCalendar data={calendarData} onChangeMonth={handleChangeMonth} />
						</View>
					) : (
						<View style={styles.emptyBox}>
							<Text style={styles.emptyText}>
								Chưa có dữ liệu tháng {calendarMonth}/{calendarYear}.
							</Text>
						</View>
					)}
				</View>

				{/* ── Emotion chart section ── */}
				<View style={styles.section}>
					<EmotionChartSection />
				</View>

				{/* ── Keywords section ── */}
				<View style={styles.section}>
					<KeywordsSection />
				</View>

				{/* ── Patterns section ── */}
				<View style={styles.section}>
					<PatternsSection />
				</View>
			</ScrollView>
		</ScreenWrapper>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		scroll: {
			flex: 1,
		},
		container: {
			paddingBottom: SPACING[48],
		},
		content: {
			paddingHorizontal: SPACING[16],
			paddingBottom: vs(32),
		},
		screenTitle: {
			fontSize: FONT_SIZE[22],
			fontWeight: "700",
			color: colors.text.primary,
			textAlign: "center",
			paddingTop: SPACING[12],
			paddingBottom: SPACING[20],
		},
		section: {
			marginBottom: SPACING[28],
		},
		weeklyHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "flex-start",
			marginBottom: SPACING[12],
		},
		sectionTitle: {
			fontSize: FONT_SIZE[17],
			fontWeight: "700",
			color: colors.brand.primary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		weekLabel: {
			fontSize: FONT_SIZE[13],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.normal,
		},
		weekNav: {
			flexDirection: "row",
			gap: s(4),
		},
		chartContainer: {
			paddingVertical: SPACING[16],
			marginBottom: SPACING[12],
			overflow: "visible",
		},
		overviewLabel: {
			fontSize: FONT_SIZE[14],
			fontWeight: "600",
			color: colors.text.primary,
			marginBottom: SPACING[8],
		},
		calendarContainer: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			padding: SPACING[16],
		},
		emptyBox: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.md,
			padding: SPACING[16],
			alignItems: "center",
		},
		emptyText: {
			fontSize: FONT_SIZE[13],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.normal,
		},
	});
}
