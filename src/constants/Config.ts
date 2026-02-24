// App-wide configuration constants

// TODO: Replace with actual backend URL (use .env when available)
export const API_BASE_URL = "http://localhost:3000/api";

// Keys used in expo-secure-store
export const TOKEN_KEYS = {
	ACCESS_TOKEN: "moodnote_access_token",
	REFRESH_TOKEN: "moodnote_refresh_token",
} as const;

// Route paths — keeps navigation logic free of magic strings
export const ROUTES = {
	LOGIN: "/(auth)/login" as const,
	REGISTER: "/(auth)/register" as const,
	FORGOT_PASSWORD: "/(auth)/forgot-password" as const,
	HOME: "/(app)" as const,
};

// JWT expiry mirrors backend config (NFR-07)
export const TOKEN_EXPIRY = {
	ACCESS_TOKEN_HOURS: 24,
	REFRESH_TOKEN_DAYS: 7,
} as const;
