// Context value shapes — consumed by useAuth, useThemeContext, useSync

import type { RegisterFormValues } from "@/schemas";
import type { ColorScheme, ThemeColors } from "@/theme/tokens";
import type {
	ForgotPasswordPayload,
	LoginPayload,
	ResendVerificationPayload,
	ResetPasswordPayload,
	User,
	VerifyEmailPayload,
	VerifyResetOtpPayload,
} from "@/types/user.types";

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthContextValue {
	// State
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	// Actions
	login: (payload: LoginPayload) => Promise<void>;
	register: (formValues: RegisterFormValues) => Promise<void>;
	logout: () => Promise<void>;
	forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
	verifyEmail: (payload: VerifyEmailPayload) => Promise<void>;
	resendVerification: (payload: ResendVerificationPayload) => Promise<void>;
	verifyResetOtp: (payload: VerifyResetOtpPayload) => Promise<void>;
	resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
	updateUser: (user: User) => Promise<void>;
}

// ─── Theme ─────────────────────────────────────────────────────────────────────

export interface ThemeContextValue {
	colorScheme: ColorScheme;
	colors: ThemeColors;
	setTheme: (scheme: ColorScheme) => void;
	toggleTheme: () => void;
}

// ─── Sync ──────────────────────────────────────────────────────────────────────

export interface SyncContextValue {
	isOnline: boolean;
	isSyncing: boolean;
	pendingCount: number;
	failedCount: number; // entries that hit MAX_RETRY and need user attention
	lastSyncedAt: Date | null;
	syncNow: () => Promise<void>;
	retryFailed: () => Promise<void>; // reset retry counters + re-trigger sync
	refreshPendingCount: () => Promise<void>;
}
