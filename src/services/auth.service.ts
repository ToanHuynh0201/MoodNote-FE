// Authentication API calls (FR-01 to FR-04)

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
	AuthTokens,
	ChangePasswordPayload,
	ForgotPasswordPayload,
	LoginPayload,
	RegisterPayload,
	User,
} from "@/types/user.types";

export const authService = {
	// FR-02: Login with email + password
	login: (payload: LoginPayload) =>
		api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", payload),

	// FR-01: Register new account
	register: (payload: RegisterPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/register", payload),

	// FR-03: Forgot password — sends OTP to email (valid 1 hour)
	forgotPassword: (payload: ForgotPasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/forgot-password", payload),

	// FR-04: Change password (authenticated)
	changePassword: (payload: ChangePasswordPayload) =>
		api.post<ApiResponse<{ message: string }>>("/auth/change-password", payload),

	// Logout — invalidate tokens on server
	logout: () => api.post<ApiResponse<{ message: string }>>("/auth/logout"),
};
