// FR-06, FR-09: Journal list state with pagination and optimistic delete

import { useCallback, useEffect, useState } from "react";

import { entryService } from "@/services";
import type { EntryListItem, EntryPagination } from "@/types/entry.types";
import { parseError } from "@/utils";

const PAGE_LIMIT = 20;

export interface UseEntriesResult {
	entries: EntryListItem[];
	pagination: EntryPagination | null;
	isLoading: boolean;
	isRefreshing: boolean;
	isLoadingMore: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	loadMore: () => Promise<void>;
	/** Optimistic removal — call after a successful DELETE to update list instantly */
	removeEntry: (id: string) => void;
}

export function useEntries(): UseEntriesResult {
	const [entries, setEntries] = useState<EntryListItem[]>([]);
	const [pagination, setPagination] = useState<EntryPagination | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPage = useCallback(async (page: number, isRefresh: boolean) => {
		try {
			setError(null);
			const res = await entryService.getList({ page, limit: PAGE_LIMIT });
			const { entries: fetched, pagination: pag } = res.data.data;
			setEntries((prev) => (page === 1 ? fetched : [...prev, ...fetched]));
			setPagination(pag);
		} catch (err) {
			const { message } = parseError(err);
			setError(message);
		} finally {
			if (isRefresh) setIsRefreshing(false);
			else setIsLoading(false);
		}
	}, []);

	// Initial load
	useEffect(() => {
		void fetchPage(1, false);
	}, [fetchPage]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
		await fetchPage(1, true);
	}, [fetchPage]);

	const loadMore = useCallback(async () => {
		if (!pagination || pagination.page >= pagination.totalPages || isLoadingMore) return;
		setIsLoadingMore(true);
		try {
			const nextPage = pagination.page + 1;
			const res = await entryService.getList({ page: nextPage, limit: PAGE_LIMIT });
			const { entries: fetched, pagination: pag } = res.data.data;
			setEntries((prev) => [...prev, ...fetched]);
			setPagination(pag);
		} catch (err) {
			const { message } = parseError(err);
			setError(message);
		} finally {
			setIsLoadingMore(false);
		}
	}, [pagination, isLoadingMore]);

	const removeEntry = useCallback((id: string) => {
		setEntries((prev) => prev.filter((e) => e.id !== id));
		setPagination((prev) => (prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev));
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
