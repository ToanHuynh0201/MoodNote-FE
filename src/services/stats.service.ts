// FR-18, FR-20: Statistics API calls

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type {
	EmotionChartData,
	GetEmotionChartParams,
	GetKeywordsParams,
	GetPatternsParams,
	KeywordsData,
	MonthlyCalendar,
	PatternsData,
	StatsSummary,
	WeeklyStats,
} from "@/types/stats.types";
import { withErrorHandling } from "@/utils/error";

export const statsService = {
	// GET /stats/summary → writingStreak, smileStreak, sadStreak
	getSummary: withErrorHandling(() =>
		api.get<ApiResponse<StatsSummary>>("/stats/summary"),
	),

	// GET /stats/weekly?startDate=YYYY-MM-DD → 7-day sentiment + emotion data
	getWeekly: withErrorHandling((startDate: string) =>
		api.get<ApiResponse<WeeklyStats>>("/stats/weekly", { params: { startDate } }),
	),

	// GET /stats/monthly-calendar?year=Y&month=M → calendar grid data
	getMonthlyCalendar: withErrorHandling((year: number, month: number) =>
		api.get<ApiResponse<MonthlyCalendar>>("/stats/monthly-calendar", {
			params: { year, month },
		}),
	),

	// GET /stats/emotion-chart → sentiment trend over a date range
	getEmotionChart: withErrorHandling((params?: GetEmotionChartParams) =>
		api.get<ApiResponse<EmotionChartData>>("/stats/emotion-chart", { params }),
	),

	// GET /stats/keywords → top keywords from analyzed entries
	getKeywordStats: withErrorHandling((params?: GetKeywordsParams) =>
		api.get<ApiResponse<KeywordsData>>("/stats/keywords", { params }),
	),

	// GET /stats/patterns → writing patterns by day-of-week and time-of-day
	getPatterns: withErrorHandling((params?: GetPatternsParams) =>
		api.get<ApiResponse<PatternsData>>("/stats/patterns", { params }),
	),
};
