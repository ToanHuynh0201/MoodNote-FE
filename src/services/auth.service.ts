// Authentication API calls (FR-01 to FR-04)

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
	ChangePasswordPayload,
	ForgotPasswordPayload,
	LoginPayload,
	RegisterPayload,
	ResendVerificationPayload,
	ResetPasswordPayload,
	User,
	VerifyEmailPayload,
	VerifyResetOtpPayload,
} from "@/types/user.types";

export const authService = {
	// FR-02: Login with email or username + password
	login: (payload: LoginPayload) =>
		api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
			"/auth/login",
			payload,
		),

	// FR-01: Register new account
	register: (payload: RegisterPayload) =>
		api.post<ApiResponse<{ user: { id: string; email: string; username: string; name: string; createdAt: string } }>>(
			"/auth/register",
			payload,
		),

	// FR-01: Verify email with OTP sent after registration
	verifyEmail: (payload: VerifyEmailPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/verify-email", payload),

	// FR-01: Resend email verification OTP
	resendVerification: (payload: ResendVerificationPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/resend-verification", payload),

	// FR-03: Forgot password — sends OTP to email (valid 1 hour)
	forgotPassword: (payload: ForgotPasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/forgot-password", payload),

	// FR-03: Verify reset OTP — confirms OTP is valid (no token returned)
	verifyResetOtp: (payload: VerifyResetOtpPayload) =>
		api.post<ApiResponse<null>>("/auth/verify-reset-otp", payload),

	// FR-03: Reset password using resetToken from verifyResetOtp
	resetPassword: (payload: ResetPasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/reset-password", payload),

	// FR-04: Change password (authenticated)
	changePassword: (payload: ChangePasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/change-password", payload),

	// Logout — invalidate tokens on server
	logout: (payload: { refreshToken: string }) =>
		api.post<ApiResponse<{ message: string }>>("/auth/logout", payload),
};
