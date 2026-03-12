// User and authentication types (FR-01 to FR-04)

export interface User {
	id: string;
	email: string;
	username: string;
	name: string;
	createdAt: string;
	lastLogin: string;
	isVerified: boolean;
}

export interface AuthTokens {
	accessToken: string; // expires in 24 hours (NFR-07)
	refreshToken: string; // expires in 7 days (NFR-07)
}

export interface LoginPayload {
	/** email address or username */
	identifier: string;
	password: string;
}

export interface RegisterPayload {
	name: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface VerifyEmailPayload {
	email: string;
	otp: string;
}

export interface ResendVerificationPayload {
	email: string;
}

export interface VerifyResetOtpPayload {
	email: string;
	otp: string;
}

export interface ResetPasswordPayload {
	email: string;
	password: string;
	confirmPassword: string;
}

export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}
