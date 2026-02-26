import { ERROR_CODES, ERROR_MESSAGES } from "@/constants";
import { isAxiosError } from "axios";

export class ApiError extends Error {
	status: number;
	code: string;
	constructor(message: string, status = 500, code = ERROR_CODES.INTERNAL_ERROR) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}

/**
 * @param {unknown} error - Axios error object or response
 * @returns {ApiError} Parsed error
 */
export const parseError = (error: unknown): ApiError => {
	// Network error (no response or not an Axios error)
	if (!isAxiosError(error) || !error.response) {
		return new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, ERROR_CODES.NETWORK_ERROR);
	}

	const { status, data } = error.response;

	// Handle 401 with empty response body (invalid credentials)
	if (status === 401 && (!data || data === "")) {
		return new ApiError(
			"Invalid username or password. Please try again.",
			401,
			ERROR_CODES.UNAUTHORIZED,
		);
	}

	// Extract error details from various response formats
	const errorCode = data?.error?.code || data?.code || ERROR_CODES.INTERNAL_ERROR;
	const errorMessage =
		data?.error?.message || data?.message || data?.error || ERROR_MESSAGES.GENERIC_ERROR;

	// Validate error code
	const validCode = Object.values(ERROR_CODES).includes(errorCode)
		? errorCode
		: ERROR_CODES.INTERNAL_ERROR;

	// Use backend message if available, otherwise fall back to predefined message
	const finalMessage =
		errorMessage && errorMessage !== ERROR_MESSAGES.GENERIC_ERROR
			? errorMessage
			: ERROR_MESSAGES[validCode as keyof typeof ERROR_MESSAGES] || errorMessage;

	return new ApiError(finalMessage, status, validCode);
};

type WrappedResponse = {
	data?: {
		status?: string;
		code?: number;
		data?: unknown;
		pagination?: unknown;
		message?: string;
	};
};

/**
 * Simple service error handler - wraps async functions with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @returns {Function} Wrapped function that returns standardized response
 */
export const withErrorHandling = <TArgs extends unknown[], TReturn>(
	asyncFn: (...args: TArgs) => Promise<TReturn>,
) => {
	return async (...args: TArgs) => {
		try {
			const response = await asyncFn(...args);
			const r = response as WrappedResponse;

			// If response is successful, return it
			if (r.data?.status === "success" || r.data?.code === 200) {
				return {
					success: true,
					data: r.data?.data,
					pagination: r.data?.pagination,
					message: r.data?.message,
				};
			}

			// Response received but indicates failure — extract error details directly
			return {
				success: false,
				error: r.data?.message ?? ERROR_MESSAGES.GENERIC_ERROR,
				code: r.data?.code !== undefined ? String(r.data.code) : ERROR_CODES.INTERNAL_ERROR,
			};
		} catch (error: unknown) {
			const parsedError = parseError(error);

			return {
				success: false,
				error: parsedError.message,
				code: parsedError.code,
			};
		}
	};
};

/**
 * Log error with context (simplified)
 * @param {unknown} error - Error to log
 * @param {Record<string, unknown>} context - Additional context
 */
export const logError = (error: unknown, context: Record<string, unknown> = {}) => {
	console.error("Application Error:", {
		message: error instanceof Error ? error.message : String(error),
		code: error instanceof ApiError ? error.code : undefined,
		status: error instanceof ApiError ? error.status : undefined,
		timestamp: new Date().toISOString(),
		...context,
	});
};

/**
 * Check if error should trigger logout (401/403)
 * @param {unknown} error - Parsed API error
 * @returns {boolean} Whether error should trigger logout
 */
export const shouldLogout = (error: unknown): boolean => {
	if (!(error instanceof ApiError)) return false;
	return (
		error.status === 401 ||
		error.status === 403 ||
		error.code === ERROR_CODES.UNAUTHORIZED ||
		error.code === ERROR_CODES.FORBIDDEN
	);
};
