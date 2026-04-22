// FR-06: Generic auto-save hook with debounce + maxWait

import { useCallback, useEffect, useRef, useState } from "react";

import type { SaveStatus, UseAutoSaveOptions, UseAutoSaveResult } from "@/types/form.types";

export function useAutoSave({
	saveFn,
	delay = 5000,
	maxWait = 15000,
}: UseAutoSaveOptions): UseAutoSaveResult {
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	// Debounce timer — resets on every triggerSave() call
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// MaxWait timer — starts on first triggerSave() after a save, NOT reset on retriggering
	const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// In-flight Promise ref — concurrent calls join the existing save instead of duplicating
	const inFlightRef = useRef<Promise<void> | null>(null);
	// Guards setState calls after unmount
	const isMountedRef = useRef(true);
	const saveFnRef = useRef(saveFn);

	useEffect(() => {
		saveFnRef.current = saveFn;
	}, [saveFn]);

	const cancelTimers = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		if (maxWaitTimerRef.current !== null) {
			clearTimeout(maxWaitTimerRef.current);
			maxWaitTimerRef.current = null;
		}
	}, []);

	const runSave = useCallback(async () => {
		// Join an existing in-flight save instead of issuing a duplicate request
		if (inFlightRef.current !== null) return inFlightRef.current;

		cancelTimers();
		if (isMountedRef.current) setSaveStatus("saving");

		const promise = (async () => {
			try {
				await saveFnRef.current();
				if (isMountedRef.current) setSaveStatus("saved");
			} catch {
				if (isMountedRef.current) setSaveStatus("error");
			} finally {
				inFlightRef.current = null;
			}
		})();

		inFlightRef.current = promise;
		return promise;
	}, [cancelTimers]);

	const triggerSave = useCallback(() => {
		// Signal pending changes immediately — guard against overwriting "saving"
		setSaveStatus((prev) => (prev === "saving" ? "saving" : "unsaved"));

		// Reset debounce timer
		if (timerRef.current !== null) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			timerRef.current = null;
			void runSave();
		}, delay);

		// Start maxWait timer only if not already running
		if (maxWaitTimerRef.current === null) {
			maxWaitTimerRef.current = setTimeout(() => {
				maxWaitTimerRef.current = null;
				void runSave();
			}, maxWait);
		}
	}, [delay, maxWait, runSave]);

	const triggerImmediately = useCallback(async () => {
		await runSave();
	}, [runSave]);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			cancelTimers();
		};
	}, [cancelTimers]);

	return { saveStatus, triggerSave, triggerImmediately, isSaving: saveStatus === "saving" };
}
