// NFR-04: Network monitoring + sync orchestration
// NFR-18: Auto-retry failed syncs (max 3 attempts)

import {
	getMaxRetryEntries,
	getPendingEntries,
	hardDeleteEntry,
	incrementRetryCount,
	markSynced,
	markUpdateSynced,
	resetAllRetryCount,
	resetRetryCount,
	upsertListFromServer,
} from "@/db";
import { entryService } from "@/services/entry.service";
import type { SyncContextValue } from "@/types/contexts.types";
import { ApiError, logError } from "@/utils/error";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRY = 3; // NFR-18: max sync attempts per pending entry
const PERIODIC_SYNC_MS = 1 * 60 * 1000; // sync every 1 min while online (NFR-04)

// ─── Context ──────────────────────────────────────────────────────────────────

export const SyncContext = createContext<SyncContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
	children: ReactNode;
}

export function SyncProvider({ children }: Props) {
	const [isOnline, setIsOnline] = useState(true);
	const [isSyncing, setIsSyncing] = useState(false);
	const [pendingCount, setPendingCount] = useState(0);
	const [failedCount, setFailedCount] = useState(0);
	const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

	// Track previous online state to detect false→true transition
	const wasOnlineRef = useRef<boolean | null>(null);
	const isSyncingRef = useRef(false);

	const refreshPendingCount = useCallback(async () => {
		try {
			const pending = await getPendingEntries();
			// Pending = entries not yet synced AND still within retry limit
			setPendingCount(pending.filter((r) => r.retry_count < MAX_RETRY).length);
		} catch {
			// non-critical
		}
	}, []);

	const refreshFailedCount = useCallback(async () => {
		try {
			const failed = await getMaxRetryEntries(MAX_RETRY);
			setFailedCount(failed.length);
		} catch {
			// non-critical
		}
	}, []);

	const syncNow = useCallback(async () => {
		if (isSyncingRef.current) return;
		isSyncingRef.current = true;
		setIsSyncing(true);

		try {
			const pending = await getPendingEntries();
			console.log("[Sync] START - pending:", pending.length);

			for (const row of pending) {
				// NFR-18: skip entries that have hit the retry limit
				if (row.retry_count >= MAX_RETRY) {
					console.log("[Sync] SKIP (max retries=" + row.retry_count + ") local_id=" + row.local_id);
					continue;
				}

				try {
					if (row.sync_status === "pending_create") {
						console.log(
							"[Sync] UP CREATE local_id=" + row.local_id + " title=" + (row.title ?? "(no title)"),
						);
						const contentDelta = JSON.parse(row.content) as Parameters<
							typeof entryService.create
						>[0]["content"];
						const tags = JSON.parse(row.tags) as string[];

						const result = await entryService.create({
							title: row.title ?? undefined,
							content: contentDelta,
							entryDate: row.entry_date,
							inputMethod: row.input_method as "TEXT" | "VOICE",
							tags,
						});
						if (!result.success)
							throw new ApiError(result.error, result.status ?? 500, result.code);
						await markSynced(row.local_id, result.data.entry.id, result.data.entry.analysisStatus);
						await resetRetryCount(row.local_id);
						console.log(
							"[Sync] OK CREATE local_id=" + row.local_id + " -> server_id=" + result.data.entry.id,
						);
					} else if (row.sync_status === "pending_update") {
						if (!row.server_id) {
							// Never reached server — treat as pending_create
							console.log(
								"[Sync] UP UPDATE->CREATE local_id=" +
									row.local_id +
									" title=" +
									(row.title ?? "(no title)"),
							);
							const contentDelta = JSON.parse(row.content) as Parameters<
								typeof entryService.create
							>[0]["content"];
							const tags = JSON.parse(row.tags) as string[];
							const result = await entryService.create({
								title: row.title ?? undefined,
								content: contentDelta,
								entryDate: row.entry_date,
								inputMethod: row.input_method as "TEXT" | "VOICE",
								tags,
							});
							if (!result.success)
								throw new ApiError(result.error, result.status ?? 500, result.code);
							await markSynced(
								row.local_id,
								result.data.entry.id,
								result.data.entry.analysisStatus,
							);
							await resetRetryCount(row.local_id);
							console.log(
								"[Sync] OK UPDATE->CREATE local_id=" +
									row.local_id +
									" -> server_id=" +
									result.data.entry.id,
							);
						} else {
							console.log(
								"[Sync] UP UPDATE local_id=" +
									row.local_id +
									" server_id=" +
									row.server_id +
									" title=" +
									(row.title ?? "(no title)"),
							);
							const contentDelta = JSON.parse(row.content) as Parameters<
								typeof entryService.update
							>[1]["content"];
							const tags = JSON.parse(row.tags) as string[];
							const result = await entryService.update(row.server_id, {
								title: row.title ?? undefined,
								content: contentDelta,
								tags,
							});
							if (!result.success)
								throw new ApiError(result.error, result.status ?? 500, result.code);
							await markUpdateSynced(row.local_id);
							await resetRetryCount(row.local_id);
							console.log("[Sync] OK UPDATE local_id=" + row.local_id);
						}
					} else if (row.sync_status === "pending_delete") {
						if (!row.server_id) {
							// Never reached server — safe to hard-delete
							console.log("[Sync] DEL (local-only) local_id=" + row.local_id);
							await hardDeleteEntry(row.local_id);
							console.log("[Sync] OK DEL local_id=" + row.local_id);
						} else {
							console.log("[Sync] DEL local_id=" + row.local_id + " server_id=" + row.server_id);
							const deleteResult = await entryService.delete(row.server_id);
							if (!deleteResult.success) {
								// 404 = server doesn't have it — clean up locally
								if (deleteResult.status === 404) {
									console.log("[Sync] DEL 404 on server - cleaning up locally");
								} else {
									throw new ApiError(
										deleteResult.error,
										deleteResult.status ?? 500,
										deleteResult.code,
									);
								}
							}
							await hardDeleteEntry(row.local_id);
							console.log("[Sync] OK DEL local_id=" + row.local_id);
						}
					}
				} catch (err) {
					console.log("[Sync] ERR local_id=" + row.local_id + " status=" + row.sync_status, err);
					logError(err, { context: "SyncContext.syncNow" });
					await incrementRetryCount(row.local_id); // NFR-18: track failures
					// Continue to next item — retry on next sync cycle (until MAX_RETRY)
				}
			}

			// Always refresh list from server — picks up entries added from other sessions
			console.log("[Sync] DOWN refreshing list from server...");
			const listResult = await entryService.getList({ page: 1, limit: 100 });
			if (listResult.success) {
				await upsertListFromServer(listResult.data.entries);
				console.log("[Sync] OK list refreshed - entries:", listResult.data.entries.length);
			} else {
				console.log("[Sync] WARN list refresh failed (non-critical)");
			}

			setLastSyncedAt(new Date());
			console.log("[Sync] DONE");
		} catch (err) {
			console.log("[Sync] ERR top-level", err);
			logError(err, { context: "SyncContext.syncNow top-level" });
		} finally {
			isSyncingRef.current = false;
			setIsSyncing(false);
			await refreshPendingCount();
			await refreshFailedCount();
		}
	}, [refreshPendingCount, refreshFailedCount]);

	const retryFailed = useCallback(async () => {
		await resetAllRetryCount(MAX_RETRY);
		await refreshFailedCount();
		await refreshPendingCount();
		void syncNow();
	}, [refreshFailedCount, refreshPendingCount, syncNow]);

	// Network state subscription
	useEffect(() => {
		// Get initial state and trigger an immediate sync if online
		void NetInfo.fetch().then((state: NetInfoState) => {
			const online = state.isConnected === true && state.isInternetReachable !== false;
			console.log("[Network] initial state:", online ? "ONLINE" : "OFFLINE");
			setIsOnline(online);
			wasOnlineRef.current = online;
			// Sync on startup — listener only fires on state *changes*, so we must
			// trigger here to push pending entries and pull new server entries on open.
			if (online) void syncNow();
		});

		const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
			const online = state.isConnected === true && state.isInternetReachable !== false;
			setIsOnline(online);

			// Trigger sync on false→true transition
			if (!wasOnlineRef.current && online) {
				console.log("[Network] OFFLINE -> ONLINE - triggering sync");
				void syncNow();
			} else if (wasOnlineRef.current && !online) {
				console.log("[Network] ONLINE -> OFFLINE");
			}
			wasOnlineRef.current = online;
		});

		return () => unsubscribe();
	}, [syncNow]);

	// Periodic sync every 5 minutes while online (NFR-04)
	useEffect(() => {
		const interval = setInterval(() => {
			if (wasOnlineRef.current) {
				console.log("[Sync] PERIODIC trigger");
				void syncNow();
			}
		}, PERIODIC_SYNC_MS);
		return () => clearInterval(interval);
	}, [syncNow]);

	// Load initial pending/failed counts
	useEffect(() => {
		void refreshPendingCount();
		void refreshFailedCount();
	}, [refreshPendingCount, refreshFailedCount]);

	return (
		<SyncContext.Provider
			value={{
				isOnline,
				isSyncing,
				pendingCount,
				failedCount,
				lastSyncedAt,
				syncNow,
				retryFailed,
				refreshPendingCount,
			}}>
			{children}
		</SyncContext.Provider>
	);
}
