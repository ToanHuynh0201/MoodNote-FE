// FR-18, FR-20: Statistics & report API types

import type { EmotionType } from "./entry.types";

// GET /stats/summary
export interface StatsSummary {
	writingStreak: number;
	smileStreak: number;
	sadStreak: number;
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
