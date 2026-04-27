// FR-18, FR-20: Statistics & report API types

import type { EmotionType } from "./entry.types";

// GET /stats/summary
export interface StatsSummary {
	writingStreak: number;
	positiveStreak: number;
	negativeStreak: number;
}

// GET /stats/weekly
export interface WeeklyDay {
	date: string; // YYYY-MM-DD
	dayLabel: string; // "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN"
	emotion: EmotionType | null;
	sentimentScore: number | null; // -1.0 to +1.0
	hasEntry: boolean;
}

export interface WeeklyStats {
	weekLabel: string; // e.g. "1/12 - 7/12"
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	days: WeeklyDay[]; // always 7 items, Mon → Sun
}

// GET /stats/monthly-calendar
export interface CalendarDay {
	date: string; // YYYY-MM-DD
	day: number; // 1–31
	emotion: EmotionType | null;
	hasEntry: boolean;
}

export interface MonthlyCalendar {
	year: number;
	month: number; // 1–12
	daysInMonth: number;
	days: CalendarDay[];
}

// ─── GET /stats/emotion-chart ────────────────────────────────────────────────

export interface EmotionChartRange {
	startDate: string;
	endDate: string;
	days: number;
}

export interface EmotionChartDataPoint {
	date: string;
	sentimentScore: number;
	primaryEmotion: EmotionType;
	entryId: string;
}

export interface EmotionChartSummary {
	averageSentiment: number | null;
	trend: "up" | "down" | "stable";
	totalEntries: number;
}

export interface EmotionChartData {
	range: EmotionChartRange;
	dataPoints: EmotionChartDataPoint[];
	summary: EmotionChartSummary;
}

export interface GetEmotionChartParams {
	range?: 7 | 14 | 30 | 90;
	startDate?: string;
	endDate?: string;
}

// ─── GET /stats/keywords ─────────────────────────────────────────────────────

export interface KeywordStat {
	keyword: string;
	count: number;
	entryIds: string[];
}

export interface KeywordsData {
	keywords: KeywordStat[];
	totalAnalyzed: number;
	range: EmotionChartRange;
}

export interface GetKeywordsParams {
	range?: 7 | 14 | 30 | 90;
	startDate?: string;
	endDate?: string;
	limit?: number;
}

// ─── GET /stats/patterns ─────────────────────────────────────────────────────

export type EmotionCounts = Record<EmotionType, number>;

export interface DayOfWeekPattern {
	dayIndex: number;
	day: string;
	totalEntries: number;
	emotionCounts: EmotionCounts;
	dominantEmotion: EmotionType;
	averageSentiment: number;
}

export interface TimeOfDayPattern {
	period: "morning" | "afternoon" | "evening" | "night";
	hours: string;
	totalEntries: number;
	emotionCounts: EmotionCounts;
	dominantEmotion: EmotionType;
	averageSentiment: number;
}

export type PatternsData =
	| { hasEnoughData: false; totalEntries: number }
	| {
			hasEnoughData: true;
			totalEntries: number;
			byDayOfWeek: DayOfWeekPattern[];
			byTimeOfDay: TimeOfDayPattern[];
	  };

export interface GetPatternsParams {
	range?: 30 | 60 | 90;
}
