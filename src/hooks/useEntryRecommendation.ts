// FR-11: Fetch and poll music recommendation for a specific entry

import { useCallback, useEffect, useRef, useState } from "react";

import { musicService } from "@/services";
import type { MusicStatus } from "@/types/entry.types";
import type { MusicRecommendation } from "@/types/music.types";
import { logError } from "@/utils";

const MUSIC_POLL_INTERVAL_MS = 2000;
const MUSIC_POLLING_STATUSES: MusicStatus[] = ["PENDING", "GENERATING"];

interface UseEntryRecommendationResult {
	recommendation: MusicRecommendation | null;
	isLoading: boolean;
	isPolling: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

export function useEntryRecommendation(
	entryId: string,
	musicStatus: MusicStatus,
): UseEntryRecommendationResult {
	const [recommendation, setRecommendation] = useState<MusicRecommendation | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isPolling, setIsPolling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const stopPolling = useCallback(() => {
		if (pollingRef.current != null) {
			clearInterval(pollingRef.current);
			pollingRef.current = null;
		}
		setIsPolling(false);
	}, []);

	const startPolling = useCallback(() => {
		if (pollingRef.current != null) return;
		setIsPolling(true);
		pollingRef.current = setInterval(() => {
			void (async () => {
				try {
					const result = await musicService.getByEntry(entryId);
					if (!result.success) return;
					const rec = result.data?.recommendation ?? null;
					if (rec != null) {
						setRecommendation(rec);
						stopPolling();
					}
				} catch (err) {
					logError(err, { context: "useEntryRecommendation.poll" });
				}
			})();
		}, MUSIC_POLL_INTERVAL_MS);
	}, [entryId, stopPolling]);

	const fetchRecommendation = useCallback(async () => {
		if (musicStatus === "FAILED") return;

		setIsLoading(true);
		setError(null);
		try {
			if (MUSIC_POLLING_STATUSES.includes(musicStatus)) {
				startPolling();
				return;
			}

			const result = await musicService.getByEntry(entryId);
			if (!result.success) {
				setError("Không thể tải gợi ý nhạc.");
				return;
			}

			const rec = result.data?.recommendation ?? null;
			if (rec != null) {
				setRecommendation(rec);
			} else {
				startPolling();
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Không thể tải gợi ý nhạc.";
			setError(message);
			logError(err, { context: "useEntryRecommendation.fetch" });
		} finally {
			setIsLoading(false);
		}
	}, [entryId, musicStatus, startPolling]);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		stopPolling();
		try {
			const result = await musicService.refreshRecommendation(entryId);
			if (!result.success) {
				setError("Không thể làm mới gợi ý nhạc.");
				return;
			}
			setRecommendation(result.data.recommendation);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Không thể làm mới gợi ý nhạc.";
			setError(message);
			logError(err, { context: "useEntryRecommendation.refresh" });
		} finally {
			setIsLoading(false);
		}
	}, [entryId, stopPolling]);

	useEffect(() => {
		void fetchRecommendation();
		return () => stopPolling();
	}, [fetchRecommendation, stopPolling]);

	return { recommendation, isLoading, isPolling, error, refresh };
}
