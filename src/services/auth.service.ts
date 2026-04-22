// Authentication API calls (FR-01 to FR-04)

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
	ChangePasswordPayload,
	ForgotPasswordPayload,
	LoginPayload,
	RegisterPayload,
	ResendResetOtpPayload,
	ResendVerificationPayload,
	ResetPasswordPayload,
	User,
	VerifyEmailPayload,
	VerifyResetOtpPayload,
} from "@/types/user.types";
import { withErrorHandling } from "@/utils/error";

export const authService = {
	// FR-02: Login with email or username + password
	login: withErrorHandling((payload: LoginPayload) =>
		api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
			"/auth/login",
			payload,
		),
	),

	// FR-01: Register new account
	register: withErrorHandling((payload: RegisterPayload) =>
		api.post<ApiResponse<{ user: { id: string; email: string; username: string; name: string; createdAt: string } }>>(
			"/auth/register",
			payload,
		),
	),

	// FR-01: Verify email with OTP sent after registration
	verifyEmail: withErrorHandling((payload: VerifyEmailPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/verify-email", payload),
	),

	// FR-01: Resend email verification OTP
	resendVerification: withErrorHandling((payload: ResendVerificationPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/resend-verification", payload),
	),

	// FR-03: Forgot password — sends OTP to email (valid 1 hour)
	forgotPassword: withErrorHandling((payload: ForgotPasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/forgot-password", payload),
	),

	// FR-03: Verify reset OTP — confirms OTP is valid (no token returned)
	verifyResetOtp: withErrorHandling((payload: VerifyResetOtpPayload) =>
		api.post<ApiResponse<null>>("/auth/verify-reset-otp", payload),
	),

	// FR-03: Resend reset OTP (when OTP expired or not received)
	resendResetOtp: withErrorHandling((payload: ResendResetOtpPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/resend-reset-otp", payload),
	),

	// FR-03: Reset password using resetToken from verifyResetOtp
	resetPassword: withErrorHandling((payload: ResetPasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/reset-password", payload),
	),

	// FR-04: Change password (authenticated)
	changePassword: withErrorHandling((payload: ChangePasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/change-password", payload),
	),

	// Logout — invalidate tokens on server; optionally removes FCM device token
	logout: withErrorHandling((payload: { refreshToken: string; deviceToken?: string }) =>
		api.post<ApiResponse<{ message: string }>>("/auth/logout", payload),
	),
};
