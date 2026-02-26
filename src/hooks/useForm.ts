import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import {
	type FieldValues,
	type Path,
	type Resolver,
	type SubmitErrorHandler,
	type SubmitHandler,
	type UseFormProps,
	type UseFormReturn,
	useForm as useRHForm,
} from "react-hook-form";
import type { ZodType } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseFormOptions<TValues extends FieldValues> extends Omit<
	UseFormProps<TValues>,
	"resolver"
> {
	/** Zod schema to validate the form */
	schema: ZodType<TValues>;
	/** Called after successful validation */
	onSubmit: SubmitHandler<TValues>;
	/** Called when validation fails (optional) */
	onError?: SubmitErrorHandler<TValues>;
}

export interface UseFormResult<TValues extends FieldValues> extends UseFormReturn<TValues> {
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Generic form hook powered by react-hook-form + Zod.
 *
 * @example
 * const { getFieldProps, submitForm, isSubmitting, serverError } = useForm({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' },
 *   onSubmit: async (values) => { await authService.login(values) },
 * });
 */
export function useForm<TValues extends FieldValues>({
	schema,
	onSubmit,
	onError,
	...rhfOptions
}: UseFormOptions<TValues>): UseFormResult<TValues> {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const methods = useRHForm<TValues>({
		...rhfOptions,
		// NOTE: Zod v4 changed its internal schema types in a way that breaks
		// @hookform/resolvers v5's inferred parameter type. The double-cast
		// (`as unknown as`) is intentional — it bridges the type mismatch at the
		// resolver boundary without affecting runtime behaviour.
		resolver: zodResolver(
			schema as unknown as Parameters<typeof zodResolver>[0],
		) as Resolver<TValues>,
		mode: rhfOptions.mode ?? "onTouched",
	});

	const { handleSubmit, register, watch, setValue, formState } = methods;

	// Wrap onSubmit to manage loading + clear server error
	const wrappedSubmit: SubmitHandler<TValues> = useCallback(
		async (values) => {
			setServerError(null);
			setIsSubmitting(true);
			try {
				await onSubmit(values);
			} catch (err: unknown) {
				const message =
					err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
				setServerError(message);
			} finally {
				setIsSubmitting(false);
			}
		},
		[onSubmit],
	);

	const submitForm = useCallback(
		() => handleSubmit(wrappedSubmit, onError)(),
		[handleSubmit, wrappedSubmit, onError],
	);

	/**
	 * Returns props ready to spread on a controlled TextInput / Input component.
	 * Combines react-hook-form's register with React Native's onChangeText API.
	 */
	const getFieldProps = useCallback(
		(name: Path<TValues>) => {
			const { ref: _ref, onChange: _onChange, ...rest } = register(name);
			const errorMessage = formState.errors[name]?.message as string | undefined;

			return {
				...rest,
				value: (watch(name) as string) ?? "",
				onChangeText: (text: string) =>
					setValue(name, text as TValues[Path<TValues>], {
						shouldValidate: !!(formState.touchedFields as Record<string, unknown>)[name],
						shouldDirty: true,
					}),
				error: errorMessage,
			};
		},
		[register, watch, setValue, formState],
	);

	return {
		...methods,
		isSubmitting,
		serverError,
		setServerError,
		submitForm,
		getFieldProps,
	};
}
