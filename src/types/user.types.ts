// User and authentication types (FR-01 to FR-04)

export interface User {
	id: string;
	email: string;
	createdAt: string;
	lastLogin: string;
	isVerified: boolean;
}

export interface AuthTokens {
	accessToken: string; // expires in 24 hours (NFR-07)
	refreshToken: string; // expires in 7 days (NFR-07)
}

export interface LoginPayload {
	email: string;
	password: string;
}

/**
 * API payload for registration — `confirmPassword` is stripped before sending.
 * The form collects `RegisterFormValues` (from auth.schemas.ts) which includes
 * `confirmPassword` for UI validation, then omits it before calling the API.
 */
export interface RegisterPayload {
	username: string;
	email: string;
	password: string;
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}
