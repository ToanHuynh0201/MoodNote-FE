// FR-06, FR-09, NFR-04: Local-first journal list with server sync

import { DEFAULT_PAGE_LIMIT } from "@/constants";
import {
	getAllEntries,
	getEntryServerId,
	hardDeleteEntry,
	markEntryDeleted,
	upsertListFromServer,
} from "@/db";
import { entryService } from "@/services";
import type { EntryListItem, EntryPagination, UseEntriesResult } from "@/types/entry.types";
import { logError } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSync } from "./useSync";

export function useEntries(): UseEntriesResult {
	const { isOnline, lastSyncedAt } = useSync();

	// Full sorted list from local DB
	const [allEntries, setAllEntries] = useState<EntryListItem[]>([]);
	const [displayCount, setDisplayCount] = useState(DEFAULT_PAGE_LIMIT);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isOnlineRef = useRef(isOnline);
	useEffect(() => {
		isOnlineRef.current = isOnline;
	}, [isOnline]);

	/** Reload allEntries from local DB */
	const loadFromDb = useCallback(async () => {
		const rows = await getAllEntries();
		setAllEntries(rows);
	}, []);

	/** Fetch all pages from server and upsert into local DB */
	const syncFromServer = useCallback(async () => {
		let page = 1;
		let hasMore = true;
		while (hasMore) {
			const result = await entryService.getList({ page, limit: DEFAULT_PAGE_LIMIT });
			if (!result.success) {
				logError(result.error, { context: "useEntries.syncFromServer" });
				break;
			}
			const { entries: fetched, pagination } = result.data;
			await upsertListFromServer(fetched);
			hasMore = page < pagination.totalPages;
			page++;
			if (page > 20) break; // safety cap
		}
	}, []);

	// Initial load — show cached data immediately.
	// Server pull is handled by SyncContext.syncNow (runs on startup + periodic).
	// We reload via the lastSyncedAt effect once SyncContext reports completion.
	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			setError(null);
			try {
				await loadFromDb();
			} catch (err) {
				setError(err instanceof Error ? err.message : "An unexpected error occurred.");
			} finally {
				setIsLoading(false);
			}
		};
		void load();
	}, [loadFromDb]);

	// Reload from DB whenever SyncContext completes a sync cycle.
	// lastSyncedAt is updated by SyncContext after every syncNow() run,
	// so this fires reliably regardless of when the component mounted.
	useEffect(() => {
		if (lastSyncedAt !== null) {
			void loadFromDb();
		}
	}, [lastSyncedAt, loadFromDb]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			if (isOnlineRef.current) {
				await syncFromServer();
			}
			await loadFromDb();
			setDisplayCount(DEFAULT_PAGE_LIMIT);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred.");
		} finally {
			setIsRefreshing(false);
		}
	}, [loadFromDb, syncFromServer]);

	const loadMore = useCallback(async () => {
		if (isLoadingMore || displayCount >= allEntries.length) return;
		setIsLoadingMore(true);
		setDisplayCount((prev) => prev + DEFAULT_PAGE_LIMIT);
		setIsLoadingMore(false);
	}, [isLoadingMore, displayCount, allEntries.length]);

	const removeEntry = useCallback(async (id: string) => {
		// 1. Write to local DB (optimistic)
		await markEntryDeleted(id);
		setAllEntries((prev) => prev.filter((e) => e.id !== id));

		// 2. If online, attempt server delete in background
		if (isOnlineRef.current) {
			const serverId = await getEntryServerId(id);
			if (serverId) {
				const result = await entryService.delete(serverId);
				if (!result.success) {
					logError(result.error, { context: "useEntries.removeEntry server delete" });
					// Leave as pending_delete — sync engine will retry
				} else {
					await hardDeleteEntry(id);
				}
			}
		}
	}, []);

	// Derived paginated slice
	const entries = allEntries.slice(0, displayCount);
	const pagination: EntryPagination | null =
		allEntries.length > 0
			? {
					total: allEntries.length,
					page: Math.ceil(displayCount / DEFAULT_PAGE_LIMIT),
					limit: DEFAULT_PAGE_LIMIT,
					totalPages: Math.ceil(allEntries.length / DEFAULT_PAGE_LIMIT),
				}
			: null;

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
