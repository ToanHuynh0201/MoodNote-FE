// FR-06, FR-09, NFR-04: Local-first single entry state, update, and delete

import {
	getEntryById,
	getEntryServerId,
	hardDeleteEntry,
	markEntryDeleted,
	markUpdateSynced,
	updateEntry as dbUpdateEntry,
	upsertFromServer,
} from "@/db";
import { entryService } from "@/services";
import type { Entry, UpdateEntryPayload, UseEntryResult } from "@/types/entry.types";
import { logError } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSync } from "./useSync";

export function useEntry(id: string): UseEntryResult {
	const { isOnline } = useSync();
	const [entry, setEntry] = useState<Entry | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const isOnlineRef = useRef(isOnline);
	useEffect(() => {
		isOnlineRef.current = isOnline;
	}, [isOnline]);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const local = await getEntryById(id);
				if (!cancelled) {
					if (local) {
						setEntry(local);
						// If content is a stub from list sync, fetch full content from server
						if (!local.contentFetched && isOnlineRef.current) {
							const serverId = await getEntryServerId(id);
							if (serverId) {
								const res = await entryService.getById(serverId);
								if (!res.success) {
									logError(res.error, { context: "useEntry.fetchFullContent" });
									// Non-fatal — continue showing stub content
								} else {
									await upsertFromServer(res.data.entry);
									const refreshed = await getEntryById(id);
									if (!cancelled && refreshed) setEntry(refreshed);
								}
							}
						}
					} else if (isOnlineRef.current) {
						const res = await entryService.getById(id);
						if (!cancelled) {
							if (!res.success) setError(res.error);
							else setEntry(res.data.entry);
						}
					} else {
						setError("Entry not found");
					}
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "An unexpected error occurred.");
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void load();

		return () => {
			cancelled = true;
		};
	}, [id]);

	const updateEntry = useCallback(
		async (payload: UpdateEntryPayload): Promise<Entry> => {
			const now = new Date().toISOString();

			const contentJson = payload.content
				? JSON.stringify(payload.content)
				: undefined;
			const tagsJson = payload.tags
				? JSON.stringify(payload.tags)
				: undefined;

			let wordCount: number | undefined;
			if (payload.content) {
				const text = payload.content.ops
					.map((op) => (typeof op.insert === "string" ? op.insert : ""))
					.join("")
					.trim();
				wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
			}

			// 1. Write to local DB immediately
			await dbUpdateEntry(id, {
				title: payload.title !== undefined ? (payload.title ?? null) : undefined,
				content: contentJson,
				tags: tagsJson,
				word_count: wordCount,
				updated_at: now,
			});

			// 2. Read back updated entry
			const updated = await getEntryById(id);
			if (!updated) throw new Error("Entry not found after update");
			setEntry(updated);

			// 3. Background server sync if online
			if (isOnlineRef.current) {
				const serverId = await getEntryServerId(id);
				if (serverId) {
					entryService
						.update(serverId, payload)
						.then((result) => {
							if (result.success) return markUpdateSynced(id);
							logError(result.error, { context: "useEntry.updateEntry server sync" });
						});
				}
			}

			return updated;
		},
		[id],
	);

	const deleteEntry = useCallback(async () => {
		await markEntryDeleted(id);

		if (isOnlineRef.current) {
			const serverId = await getEntryServerId(id);
			if (serverId) {
				const result = await entryService.delete(serverId);
				if (!result.success) {
					logError(result.error, { context: "useEntry.deleteEntry server delete" });
				} else {
					await hardDeleteEntry(id);
				}
			}
		}
	}, [id]);

	return { entry, isLoading, error, updateEntry, deleteEntry };
}
