import { ERROR_CODES, ERROR_MESSAGES } from "../constants";
export class ApiError extends Error {
	status: number;
	code: string;
	constructor(
		message: string,
		status = 500,
		code = ERROR_CODES.INTERNAL_ERROR,
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}

/**
 * @param {Object} error - Axios error object or response
 * @returns {ApiError} Parsed error
 */
export const parseError = (error: any) => {
	// Network error (no response)
	if (!error.response) {
		return new ApiError(
			ERROR_MESSAGES.NETWORK_ERROR,
			0,
			ERROR_CODES.NETWORK_ERROR,
		);
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
	const errorCode =
		data?.error?.code || data?.code || ERROR_CODES.INTERNAL_ERROR;
	const errorMessage =
		data?.error?.message ||
		data?.message ||
		data?.error ||
		ERROR_MESSAGES.GENERIC_ERROR;

	// Validate error code
	const validCode = Object.values(ERROR_CODES).includes(errorCode)
		? errorCode
		: ERROR_CODES.INTERNAL_ERROR;

	// Use backend message if available, otherwise fall back to predefined message
	const finalMessage =
		errorMessage && errorMessage !== ERROR_MESSAGES.GENERIC_ERROR
			? errorMessage
			: ERROR_MESSAGES[validCode as keyof typeof ERROR_MESSAGES] ||
				errorMessage;

	return new ApiError(finalMessage, status, validCode);
};

/**
 * Simple service error handler - wraps async functions with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @returns {Function} Wrapped function that returns standardized response
 */
export const withErrorHandling = <TArgs extends any[], TReturn>(
	asyncFn: (...args: TArgs) => Promise<TReturn>,
) => {
	return async (...args: TArgs) => {
		try {
			const response = await asyncFn(...args);

			// If response is successful, return it
			if (
				(response as any).data?.status === "success" ||
				(response as any).data?.code === 200
			) {
				return {
					success: true,
					data: (response as any).data.data,
					pagination: (response as any).data.pagination,
					message: (response as any).data.message,
				};
			}

			const error = parseError({ response });
			return {
				success: false,
				error: error.message,
				code: error.code,
			};
		} catch (error: any) {
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
 * @param {Error} error - Error to log
 * @param {Object} context - Additional context
 */
export const logError = (error: any, context = {}) => {
	console.error("Application Error:", {
		message: error.message,
		code: error.code,
		status: error.status,
		timestamp: new Date().toISOString(),
		...context,
	});
};

/**
 * Check if error should trigger logout (401/403)
 * @param {ApiError} error - Parsed API error
 * @returns {boolean} Whether error should trigger logout
 */
export const shouldLogout = (error: any) => {
	return (
		error.status === 401 ||
		error.status === 403 ||
		error.code === ERROR_CODES.UNAUTHORIZED ||
		error.code === ERROR_CODES.FORBIDDEN
	);
};
