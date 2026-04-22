// FR-18: Writing patterns by day-of-week and time-of-day

import { useCallback, useEffect, useState } from "react";

import { statsService } from "@/services";
import type { GetPatternsParams, PatternsData } from "@/types/stats.types";
import { logError } from "@/utils";

interface UsePatternsResult {
	data: PatternsData | null;
	isLoading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

export function usePatterns(params?: GetPatternsParams): UsePatternsResult {
	const [data, setData] = useState<PatternsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const paramsKey = JSON.stringify(params);

	const fetch = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		const res = await statsService.getPatterns(params);
		if (res.success) {
			setData(res.data);
		} else {
			setError("Không thể tải phân tích thói quen.");
			logError(res.error, { context: "usePatterns" });
		}
		setIsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paramsKey]);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			setIsLoading(true);
			setError(null);
			const res = await statsService.getPatterns(params);
			if (cancelled) return;
			if (res.success) {
				setData(res.data);
			} else {
				setError("Không thể tải phân tích thói quen.");
				logError(res.error, { context: "usePatterns" });
			}
			setIsLoading(false);
		})();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paramsKey]);

	return { data, isLoading, error, refresh: fetch };
}
