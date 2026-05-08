// User and authentication types (FR-01 to FR-05)

import type { EmotionType, InputMethod, QuillDelta } from "./entry.types";

export interface User {
	id: string;
	email: string;
	username: string;
	name: string;
	isEmailVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

// FR-05: Profile update payload
export interface UpdateProfilePayload {
	name?: string;
	username?: string;
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

export interface ResendResetOtpPayload {
	email: string;
}

// FR-05: User settings
export type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

// NFR-11: Delete account
export interface DeleteAccountPayload {
	password: string;
}

export interface UserSettings {
	theme: ThemePreference;
	language: string;
	allowTrainingData: boolean;
	updatedAt: string;
}

export interface UpdateSettingsPayload {
	theme?: ThemePreference;
	language?: string;
	allowTrainingData?: boolean;
}

// NFR-11: Data portability — export/import

export interface ExportAnalysis {
	primaryEmotion: EmotionType;
	sentimentScore: number;
	intensity: number;
	confidence: number | null;
	emotionDistribution: Record<EmotionType, number> | null;
	keywords: string[];
	analyzedAt: string;
}

export interface ExportEntry {
	entryDate: string;
	createdAt: string;
	inputMethod: InputMethod;
	wordCount: number;
	content: { title: string | null; content: QuillDelta } | null;
	analysis: ExportAnalysis | null;
}

export interface ExportData {
	exportedAt: string;
	profile: Pick<User, "id" | "email" | "username" | "name" | "isEmailVerified" | "createdAt">;
	settings: { theme: ThemePreference; language: string };
	entries: ExportEntry[];
}

export interface ImportEntry {
	entryDate: string;
	createdAt?: string;
	inputMethod?: InputMethod;
	wordCount?: number;
	content: { title: string | null; content: QuillDelta } | null;
	analysis: ExportAnalysis | null;
}

export interface ImportData {
	entries?: ImportEntry[];
	settings?: { theme?: ThemePreference; language?: string };
}

export interface ImportResult {
	importedEntries: number;
	skippedEntries: number;
	settingsUpdated: boolean;
}
