import { AUTH_CONFIG } from "@/constants";
import type { RegisterFormValues } from "@/schemas";
import { authService } from "@/services/auth.service";
import type { AuthContextValue } from "@/types/contexts.types";
import type {
	ForgotPasswordPayload,
	LoginPayload,
	ResendVerificationPayload,
	ResetPasswordPayload,
	User,
	VerifyEmailPayload,
	VerifyResetOtpPayload,
} from "@/types/user.types";
import { ApiError, logError } from "@/utils/error";
import {
	clearStorage,
	getAuthToken,
	getStorageItem,
	getUserData,
	setAuthToken,
	setStorageItem,
	setUserData,
} from "@/utils/storage";
import { AuthorizationStatus, getMessaging, getToken, requestPermission } from "@react-native-firebase/messaging";
import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { notificationService } from "@/services/notification.service";

// ─── Internal state ────────────────────────────────────────────────────────────

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [state, setState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
	});

	// ─── FCM helpers ─────────────────────────────────────────────────────────────

	// FR-21: Register FCM device token after authentication
	const registerFcmToken = useCallback(async (): Promise<void> => {
		try {
			const authStatus = await requestPermission(getMessaging());
			const isAuthorized =
				authStatus === AuthorizationStatus.AUTHORIZED ||
				authStatus === AuthorizationStatus.PROVISIONAL;
			if (!isAuthorized) return;

			const token = await getToken(getMessaging());
			const platform =
				Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : undefined;
			await notificationService.registerDeviceToken({ token, platform });
		} catch (err) {
			logError(err, { context: "AuthContext.registerFcmToken" });
		}
	}, []);

	// FR-21: Unregister FCM device token on logout
	const unregisterFcmToken = useCallback(async (): Promise<void> => {
		try {
			const token = await getToken(getMessaging());
			await notificationService.deleteDeviceToken({ token });
		} catch (err) {
			logError(err, { context: "AuthContext.unregisterFcmToken" });
		}
	}, []);

	// Restore session from secure storage on app start
	useEffect(() => {
		(async () => {
			try {
				const [token, user] = await Promise.all([getAuthToken(), getUserData()]);

				if (token && user) {
					setState({ user, isAuthenticated: true, isLoading: false });
					void registerFcmToken(); // FR-21
				} else {
					setState((s) => ({ ...s, isLoading: false }));
				}
			} catch {
				setState((s) => ({ ...s, isLoading: false }));
			}
		})();
	}, []);

	// ─── Actions ─────────────────────────────────────────────────────────────────

	const login = useCallback(async (payload: LoginPayload) => {
		const result = await authService.login(payload);
		if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);

		const { user, accessToken, refreshToken } = result.data;

		await Promise.all([
			await setAuthToken(accessToken),
			await setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, refreshToken),

			setUserData(user),
		]);

		setState({ user, isAuthenticated: true, isLoading: false });
		void registerFcmToken(); // FR-21
	}, [registerFcmToken]);

	const register = useCallback(async (formValues: RegisterFormValues) => {
		const result = await authService.register(formValues);
		if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
	}, []);

	const logout = useCallback(async () => {
		void unregisterFcmToken(); // FR-21 — fire-and-forget, không block logout
		try {
			const refreshToken = await getStorageItem<string>(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
			if (refreshToken) {
				const result = await authService.logout({ refreshToken });
				if (!result.success) logError(result.error, { context: "logout" });
			}
		} catch (err) {
			logError(err, { context: "logout" });
		} finally {
			await clearStorage();
			setState({ user: null, isAuthenticated: false, isLoading: false });
		}
	}, [unregisterFcmToken]);

	const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
		const result = await authService.forgotPassword(payload);
		if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
	}, []);

	const verifyEmail = useCallback(async (payload: VerifyEmailPayload) => {
		const result = await authService.verifyEmail(payload);
		if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
	}, []);

	const resendVerification = useCallback(async (payload: ResendVerificationPayload) => {
		const result = await authService.resendVerification(payload);
		if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
	}, []);

	const verifyResetOtp = useCallback(async (payload: VerifyResetOtpPayload): Promise<void> => {
		const result = await authService.verifyResetOtp(payload);
		if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
	}, []);

	const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
		const result = await authService.resetPassword(payload);
		if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
	}, []);

	const updateUser = useCallback(async (user: User) => {
		await setUserData(user);
		setState((s) => ({ ...s, user }));
	}, []);

	return (
		<AuthContext.Provider
			value={{
				...state,
				login,
				register,
				logout,
				forgotPassword,
				verifyEmail,
				resendVerification,
				verifyResetOtp,
				resetPassword,
				updateUser,
			}}>
			{children}
		</AuthContext.Provider>
	);
}
