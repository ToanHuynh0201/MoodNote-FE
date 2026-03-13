// FR-06, FR-09: Single entry state, update, and delete

import { useCallback, useEffect, useState } from "react";

import { entryService } from "@/services";
import type { Entry, UpdateEntryPayload } from "@/types/entry.types";
import { parseError } from "@/utils";

export interface UseEntryResult {
	entry: Entry | null;
	isLoading: boolean;
	error: string | null;
	/** Updates the entry via PATCH and refreshes local state from response */
	updateEntry: (payload: UpdateEntryPayload) => Promise<Entry>;
	/** Deletes the entry permanently. Throws on error for the caller to handle. */
	deleteEntry: () => Promise<void>;
}

export function useEntry(id: string): UseEntryResult {
	const [entry, setEntry] = useState<Entry | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const fetch = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await entryService.getById(id);
				if (!cancelled) setEntry(res.data.data.entry);
			} catch (err) {
				if (!cancelled) {
					const { message } = parseError(err);
					setError(message);
				}
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void fetch();

		return () => {
			cancelled = true;
		};
	}, [id]);

	const updateEntry = useCallback(
		async (payload: UpdateEntryPayload): Promise<Entry> => {
			const res = await entryService.update(id, payload);
			const updated = res.data.data.entry;
			setEntry(updated);
			return updated;
		},
		[id],
	);

	const deleteEntry = useCallback(async () => {
		await entryService.delete(id);
	}, [id]);

	return { entry, isLoading, error, updateEntry, deleteEntry };
}
