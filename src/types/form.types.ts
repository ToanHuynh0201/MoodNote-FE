// Form and auto-save hook types — consumed by useForm and useAutoSave

import type {
	FieldValues,
	Path,
	SubmitErrorHandler,
	SubmitHandler,
	UseFormProps,
	UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";

// ─── useForm ───────────────────────────────────────────────────────────────────

export interface UseFormOptions<TValues extends FieldValues>
	extends Omit<UseFormProps<TValues>, "resolver"> {
	/** Zod schema to validate the form */
	schema: ZodType<TValues>;
	/** Called after successful validation */
	onSubmit: SubmitHandler<TValues>;
	/** Called when validation fails (optional) */
	onError?: SubmitErrorHandler<TValues>;
}

export interface UseFormResult<TValues extends FieldValues>
	extends UseFormReturn<TValues> {
	/** Whether async onSubmit is running */
	isSubmitting: boolean;
	/** Server/API error message, if any */
	serverError: string | null;
	/** Set a server-side error manually (e.g. from API response) */
	setServerError: (message: string | null) => void;
	/** Pre-bound handleSubmit that feeds onSubmit/onError */
	submitForm: () => void;
	/** Shorthand: register + retrieve error message for a field */
	getFieldProps: (name: Path<TValues>) => {
		value: string;
		onChangeText: (text: string) => void;
		error?: string;
	};
}

// ─── useAutoSave ───────────────────────────────────────────────────────────────

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export interface UseAutoSaveOptions {
	/** Async function that performs the actual save. Wrap in useCallback in the calling component. */
	saveFn: () => Promise<void>;
	/** Debounce delay in milliseconds. Defaults to 5000ms (FR-06: 5–10s). */
	delay?: number;
	/** Maximum ms before forcing a save even during continuous typing. Defaults to 15000ms. */
	maxWait?: number;
}

export interface UseAutoSaveResult {
	saveStatus: SaveStatus;
	/** Schedules a save after the debounce delay. Resets the timer if called again. Sets status to "unsaved" immediately. */
	triggerSave: () => void;
	/** Cancels any pending debounce and saves immediately. */
	triggerImmediately: () => Promise<void>;
	/** True while the async saveFn is in flight. */
	isSaving: boolean;
}
