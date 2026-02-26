import { AUTH_CONFIG } from "@/constants";
import type { RegisterFormValues } from "@/schemas";
import { authService } from "@/services/auth.service";
import type { ForgotPasswordPayload, LoginPayload, User } from "@/types/user.types";
import {
	clearStorage,
	getAuthToken,
	getUserData,
	setAuthToken,
	setStorageItem,
	setUserData,
} from "@/utils/storage";
import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

interface AuthContextValue extends AuthState {
	login: (payload: LoginPayload) => Promise<void>;
	register: (formValues: RegisterFormValues) => Promise<void>;
	logout: () => Promise<void>;
	forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
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

	// Restore session from secure storage on app start
	useEffect(() => {
		(async () => {
			try {
				const [token, user] = await Promise.all([getAuthToken(), getUserData()]);

				if (token && user) {
					setState({ user, isAuthenticated: true, isLoading: false });
				} else {
					setState((s) => ({ ...s, isLoading: false }));
				}
			} catch {
				setState((s) => ({ ...s, isLoading: false }));
			}
		})();
	}, []);

	const login = useCallback(async (payload: LoginPayload) => {
		const response = await authService.login(payload);
		const { user, tokens } = response.data.data;

		await Promise.all([
			setAuthToken(tokens.accessToken),
			setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken),
			setUserData(user),
		]);

		setState({ user, isAuthenticated: true, isLoading: false });
	}, []);

	const register = useCallback(async (formValues: RegisterFormValues) => {
		// Strip confirmPassword — only email + password are sent to the API
		const { confirmPassword: _omit, ...payload } = formValues;
		await authService.register(payload);
	}, []);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch {
			// ignore server errors on logout
		} finally {
			await clearStorage();
			setState({ user: null, isAuthenticated: false, isLoading: false });
		}
	}, []);

	const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
		await authService.forgotPassword(payload);
	}, []);

	return (
		<AuthContext.Provider value={{ ...state, login, register, logout, forgotPassword }}>
			{children}
		</AuthContext.Provider>
	);
}
