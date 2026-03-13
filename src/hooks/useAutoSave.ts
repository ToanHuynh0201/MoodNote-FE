// FR-06: Generic auto-save hook with debounce

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseAutoSaveOptions {
	/** Async function that performs the actual save. Wrap in useCallback in the calling component. */
	saveFn: () => Promise<void>;
	/** Debounce delay in milliseconds. Defaults to 7000ms (FR-06: 5–10s). */
	delay?: number;
}

export interface UseAutoSaveResult {
	saveStatus: SaveStatus;
	/** Schedules a save after the debounce delay. Resets the timer if called again. */
	triggerSave: () => void;
	/** Cancels any pending debounce and saves immediately. */
	triggerImmediately: () => Promise<void>;
}

export function useAutoSave({ saveFn, delay = 7000 }: UseAutoSaveOptions): UseAutoSaveResult {
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	// useRef — not useState — so resetting the timer doesn't cause re-renders
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveFnRef = useRef(saveFn);

	// Keep saveFnRef current without adding it to triggerSave's deps
	useEffect(() => {
		saveFnRef.current = saveFn;
	}, [saveFn]);

	const runSave = useCallback(async () => {
		setSaveStatus("saving");
		try {
			await saveFnRef.current();
			setSaveStatus("saved");
		} catch {
			setSaveStatus("error");
		}
	}, []);

	const triggerSave = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
		}
		timerRef.current = setTimeout(() => {
			timerRef.current = null;
			void runSave();
		}, delay);
	}, [delay, runSave]);

	const triggerImmediately = useCallback(async () => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		await runSave();
	}, [runSave]);

	// Cancel pending timer on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	return { saveStatus, triggerSave, triggerImmediately };
}
