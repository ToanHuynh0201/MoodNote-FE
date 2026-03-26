// NFR-04: Network monitoring + sync orchestration

import {
	getPendingEntries,
	hardDeleteEntry,
	markSynced,
	markUpdateSynced,
	upsertListFromServer,
} from "@/db";
import { entryService } from "@/services/entry.service";
import { ApiError, logError } from "@/utils/error";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { SyncContextValue } from "@/types/contexts.types";

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
	const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

	// Track previous online state to detect false→true transition
	const wasOnlineRef = useRef<boolean | null>(null);
	const isSyncingRef = useRef(false);

	const refreshPendingCount = useCallback(async () => {
		try {
			const pending = await getPendingEntries();
			setPendingCount(pending.length);
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

			if (pending.length === 0) {
				console.log("[Sync] OK - nothing to sync");
			}

			for (const row of pending) {
				try {
					if (row.sync_status === "pending_create") {
						console.log("[Sync] UP CREATE local_id=" + row.local_id + " title=" + (row.title ?? "(no title)"));
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
						if (!result.success) throw new ApiError(result.error, result.status ?? 500, result.code);
						await markSynced(
							row.local_id,
							result.data.entry.id,
							result.data.entry.analysisStatus,
						);
						console.log("[Sync] OK CREATE local_id=" + row.local_id + " -> server_id=" + result.data.entry.id);
					} else if (row.sync_status === "pending_update") {
						if (!row.server_id) {
							// Never reached server — treat as pending_create
							console.log("[Sync] UP UPDATE->CREATE local_id=" + row.local_id + " title=" + (row.title ?? "(no title)"));
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
							if (!result.success) throw new ApiError(result.error, result.status ?? 500, result.code);
							await markSynced(
								row.local_id,
								result.data.entry.id,
								result.data.entry.analysisStatus,
							);
							console.log("[Sync] OK UPDATE->CREATE local_id=" + row.local_id + " -> server_id=" + result.data.entry.id);
						} else {
							console.log("[Sync] UP UPDATE local_id=" + row.local_id + " server_id=" + row.server_id + " title=" + (row.title ?? "(no title)"));
							const contentDelta = JSON.parse(row.content) as Parameters<
								typeof entryService.update
							>[1]["content"];
							const tags = JSON.parse(row.tags) as string[];
							const result = await entryService.update(row.server_id, {
								title: row.title ?? undefined,
								content: contentDelta,
								tags,
							});
							if (!result.success) throw new ApiError(result.error, result.status ?? 500, result.code);
							await markUpdateSynced(row.local_id);
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
									throw new ApiError(deleteResult.error, deleteResult.status ?? 500, deleteResult.code);
								}
							}
							await hardDeleteEntry(row.local_id);
							console.log("[Sync] OK DEL local_id=" + row.local_id);
						}
					}
				} catch (err) {
					console.log("[Sync] ERR local_id=" + row.local_id + " status=" + row.sync_status, err);
					logError(err, { context: "SyncContext.syncNow" });
					// Continue to next item — retry on next sync cycle
				}
			}

			// After sync, refresh list from server if we processed anything
			if (pending.length > 0) {
				console.log("[Sync] DOWN refreshing list from server...");
				const listResult = await entryService.getList({ page: 1, limit: 100 });
				if (listResult.success) {
					await upsertListFromServer(listResult.data.entries);
					console.log("[Sync] OK list refreshed - entries:", listResult.data.entries.length);
				} else {
					console.log("[Sync] WARN list refresh failed (non-critical)");
				}
			}

			setLastSyncedAt(new Date());
			await refreshPendingCount();
			console.log("[Sync] DONE");
		} catch (err) {
			console.log("[Sync] ERR top-level", err);
			logError(err, { context: "SyncContext.syncNow top-level" });
		} finally {
			isSyncingRef.current = false;
			setIsSyncing(false);
		}
	}, [refreshPendingCount]);

	// Network state subscription
	useEffect(() => {
		// Get initial state
		void NetInfo.fetch().then((state: NetInfoState) => {
			const online = state.isConnected === true && state.isInternetReachable !== false;
			console.log("[Network] initial state:", online ? "ONLINE" : "OFFLINE");
			setIsOnline(online);
			wasOnlineRef.current = online;
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

	// Load initial pending count
	useEffect(() => {
		void refreshPendingCount();
	}, [refreshPendingCount]);

	return (
		<SyncContext.Provider
			value={{ isOnline, isSyncing, pendingCount, lastSyncedAt, syncNow, refreshPendingCount }}>
			{children}
		</SyncContext.Provider>
	);
}
