// FR-06, FR-09: Journal entry list with server-side pagination

import { DEFAULT_PAGE_LIMIT } from "@/constants";
import { entryService } from "@/services";
import type { EntryListItem, EntryPagination, UseEntriesResult } from "@/types/entry.types";
import { extractErrorMessage, logError } from "@/utils";
import { useCallback, useEffect, useState } from "react";

export function useEntries(): UseEntriesResult {
	const [entries, setEntries] = useState<EntryListItem[]>([]);
	const [pagination, setPagination] = useState<EntryPagination | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPage = useCallback(async (page: number) => {
		const result = await entryService.getList({ page, limit: DEFAULT_PAGE_LIMIT });
		if (!result.success) throw new Error(result.error ?? "Failed to load entries");
		return result.data;
	}, []);

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const data = await fetchPage(1);
				setEntries(data.entries);
				setPagination(data.pagination);
			} catch (err) {
				setError(extractErrorMessage(err));
			} finally {
				setIsLoading(false);
			}
		};
		void load();
	}, [fetchPage]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			const data = await fetchPage(1);
			setEntries(data.entries);
			setPagination(data.pagination);
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setIsRefreshing(false);
		}
	}, [fetchPage]);

	const loadMore = useCallback(async () => {
		if (isLoadingMore || !pagination) return;
		if (pagination.page >= pagination.totalPages) return;
		setIsLoadingMore(true);
		try {
			const data = await fetchPage(pagination.page + 1);
			setEntries((prev) => [...prev, ...data.entries]);
			setPagination(data.pagination);
		} catch (err) {
			logError(err, { context: "useEntries.loadMore" });
		} finally {
			setIsLoadingMore(false);
		}
	}, [isLoadingMore, pagination, fetchPage]);

	const removeEntry = useCallback(async (id: string): Promise<{ success: boolean }> => {
		setEntries((prev) => prev.filter((e) => e.id !== id));
		const result = await entryService.delete(id);
		if (!result.success) {
			logError(result.error, { context: "useEntries.removeEntry" });
		}
		return { success: result.success };
	}, []);

	return {
		entries,
		pagination,
		isLoading,
		isRefreshing,
		isLoadingMore,
		error,
		refresh,
		loadMore,
		removeEntry,
	};
}
