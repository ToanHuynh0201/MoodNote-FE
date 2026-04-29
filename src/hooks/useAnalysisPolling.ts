// FR-10: Poll GET /entries/:id while analysisStatus is PENDING or PROCESSING.
// Stops when COMPLETED or FAILED (or on unmount).

import { useEffect, useRef } from "react";

import { ANALYSIS_POLLING_STATUSES, ANALYSIS_POLL_INTERVAL_MS } from "@/constants";
import { entryService } from "@/services";
import type { AnalysisStatus, Entry } from "@/types/entry.types";

interface UseAnalysisPollingOptions {
	entryId: string | null;
	currentStatus: AnalysisStatus;
	onUpdate: (entry: Entry) => void;
}

export function useAnalysisPolling({
	entryId,
	currentStatus,
	onUpdate,
}: UseAnalysisPollingOptions): void {
	const onUpdateRef = useRef(onUpdate);
	useEffect(() => {
		onUpdateRef.current = onUpdate;
	});

	useEffect(() => {
		if (!entryId || !ANALYSIS_POLLING_STATUSES.includes(currentStatus)) {
			return;
		}

		const intervalId = setInterval(() => {
			void (async () => {
				const result = await entryService.getById(entryId);
				if (!result.success) return;

				const serverEntry = result.data.entry;
				if (!ANALYSIS_POLLING_STATUSES.includes(serverEntry.analysisStatus)) {
					onUpdateRef.current(serverEntry);
					clearInterval(intervalId);
				}
			})();
		}, ANALYSIS_POLL_INTERVAL_MS);

		return () => clearInterval(intervalId);
	}, [entryId, currentStatus]);
}
