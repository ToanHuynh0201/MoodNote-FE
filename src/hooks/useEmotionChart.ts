// FR-18: Emotion sentiment chart data with range selector

import { useCallback, useEffect, useState } from "react";

import { statsService } from "@/services";
import type { EmotionChartData, GetEmotionChartParams } from "@/types/stats.types";
import { logError } from "@/utils";

type ChartRange = 7 | 14 | 30 | 90;

interface UseEmotionChartResult {
	data: EmotionChartData | null;
	range: ChartRange;
	isLoading: boolean;
	error: string | null;
	setRange: (range: ChartRange) => void;
	refresh: () => Promise<void>;
}

export function useEmotionChart(initialRange: ChartRange = 30): UseEmotionChartResult {
	const [range, setRange] = useState<ChartRange>(initialRange);
	const [data, setData] = useState<EmotionChartData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetch = useCallback(
		async (params?: GetEmotionChartParams) => {
			setIsLoading(true);
			setError(null);
			const res = await statsService.getEmotionChart(params ?? { range });
			if (res.success) {
				setData(res.data);
			} else {
				setError("Không thể tải biểu đồ cảm xúc.");
				logError(res.error, { context: "useEmotionChart" });
			}
			setIsLoading(false);
		},
		[range],
	);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			setIsLoading(true);
			setError(null);
			const res = await statsService.getEmotionChart({ range });
			if (cancelled) return;
			if (res.success) {
				setData(res.data);
			} else {
				setError("Không thể tải biểu đồ cảm xúc.");
				logError(res.error, { context: "useEmotionChart" });
			}
			setIsLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [range]);

	const refresh = useCallback(() => fetch(), [fetch]);

	return { data, range, isLoading, error, setRange, refresh };
}
