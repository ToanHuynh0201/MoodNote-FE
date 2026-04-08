// Home screen data: parallel fetch of user, streaks, recent entries, recent playlist

import { entryService, musicService, statsService, userService } from "@/services";
import type { EntryListItem } from "@/types/entry.types";
import type { MusicRecommendation } from "@/types/music.types";
import type { StatsSummary } from "@/types/stats.types";
import { logError } from "@/utils";
import { useCallback, useEffect, useState } from "react";

interface HomeData {
	username: string;
	streaks: StatsSummary | null;
	recentEntries: EntryListItem[];
	recentPlaylist: MusicRecommendation | null;
}

interface UseHomeDataResult {
	data: HomeData | null;
	isLoading: boolean;
	isRefreshing: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

async function fetchAllHomeData(): Promise<HomeData> {
	const [userRes, summaryRes, entriesRes, musicRes] = await Promise.all([
		userService.getMe(),
		statsService.getSummary(),
		entryService.getList({ limit: 3 }),
		musicService.getRecent(4),
	]);

	return {
		username: userRes.success ? userRes.data.username : "",
		streaks: summaryRes.success ? summaryRes.data : null,
		recentEntries: entriesRes.success ? entriesRes.data.entries : [],
		recentPlaylist: musicRes.success ? musicRes.data.recommendation : null,
	};
}

export function useHomeData(): UseHomeDataResult {
	const [data, setData] = useState<HomeData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async (refreshing = false) => {
		if (refreshing) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);
		try {
			const result = await fetchAllHomeData();
			setData(result);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Không thể tải dữ liệu.";
			setError(message);
			logError(err, { context: "useHomeData.load" });
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		void load(false);
	}, [load]);

	const refresh = useCallback(() => load(true), [load]);

	return { data, isLoading, isRefreshing, error, refresh };
}
