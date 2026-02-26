import { API_CONFIG, AUTH_CONFIG, ROUTES } from "@/constants";
import type { ApiResponse } from "@/types";
import {
	getAuthToken,
	getStorageItem,
	logError,
	parseError,
	removeAuthToken,
	removeStorageItem,
	removeUserData,
	setStorageItem,
	shouldLogout,
} from "@/utils";

import { router } from "expo-router";

import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

class ApiService {
	private baseUrl: string;
	private api: AxiosInstance;
	private isRefreshing: boolean = false;
	private failedQueue: Array<{
		resolve: (value: string) => void;
		reject: (reason: unknown) => void;
	}> = [];

	constructor() {
		this.baseUrl = API_CONFIG.BASE_URL;
		this.api = this._createAxiosInstance();
		this._setupInterceptors();
	}

	/**
	 * Create axios instance with base configuration
	 * @private
	 * @returns {axios.AxiosInstance} Configured axios instance
	 */
	private _createAxiosInstance() {
		return axios.create({
			baseURL: this.baseUrl,
			timeout: API_CONFIG.TIMEOUT,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Setup request and response interceptors
	 * @private
	 */
	private _setupInterceptors() {
		this._setupRequestInterceptor();
		this._setupResponseInterceptor();
	}

	/**
	 * Setup request interceptor to add auth token
	 * @private
	 */
	private _setupRequestInterceptor() {
		this.api.interceptors.request.use(
			async (config: InternalAxiosRequestConfig) => {
				// Don't send token for login/register/refresh endpoints
				if (!this._isLoginEndpoint(config.url) && !this._isRefreshEndpoint(config.url)) {
					const token = await getAuthToken();
					if (token) {
						config.headers.Authorization = `Bearer ${token}`;
					}
				}
				return config;
			},
			(error: AxiosError) => {
				const parsedError = parseError(error);
				logError(parsedError, { context: "api.request" });
				return Promise.reject(parsedError);
			},
		);
	}

	/**
	 * Setup response interceptor to handle auth errors
	 * @private
	 */
	private _setupResponseInterceptor() {
		this.api.interceptors.response.use(
			(response: AxiosResponse) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as RetryableRequestConfig;
				const parsedError = parseError(error);

				// Don't trigger logout for login endpoint errors
				if (this._isLoginEndpoint(originalRequest?.url)) {
					logError(parsedError, { context: "api.response" });
					return Promise.reject(error);
				}

				// Handle 401 errors with token refresh
				if (parsedError.status === 401 && !originalRequest._retry) {
					if (this.isRefreshing) {
						// If already refreshing, queue this request
						return new Promise((resolve, reject) => {
							this.failedQueue.push({ resolve, reject });
						})
							.then((token) => {
								originalRequest.headers.Authorization = `Bearer ${token}`;
								return this.api(originalRequest);
							})
							.catch((err) => {
								return Promise.reject(err);
							});
					}

					originalRequest._retry = true;
					this.isRefreshing = true;

					const refreshToken = await getStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
					if (!refreshToken) {
						this.isRefreshing = false;
						this._handleLogout();
						return Promise.reject(error);
					}

					try {
						const refreshResponse = await this._performTokenRefresh(refreshToken as string);

						// Check response format: { success: true, data: { accessToken, refreshToken } }
						if (refreshResponse.data.success === true && refreshResponse.data.data) {
							const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
								refreshResponse.data.data;
							await setStorageItem(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY, newAccessToken);

							if (newRefreshToken) {
								await setStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
							}

							// Update auth header for original request
							originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

							// Process queued requests
							this._processQueue(null, newAccessToken);
							this.isRefreshing = false;

							// Retry original request
							return this.api(originalRequest);
						} else {
							// Refresh failed
							this._processQueue(error, null);
							this.isRefreshing = false;
							this._handleLogout();
							return Promise.reject(error);
						}
					} catch (refreshError) {
						logError(parseError(refreshError), {
							context: "api.refresh",
						});
						this._processQueue(refreshError, null);
						this.isRefreshing = false;
						this._handleLogout();
						return Promise.reject(refreshError);
					}
				}

				// Handle other auth errors
				if (shouldLogout(parsedError)) {
					this._handleLogout();
				}

				logError(parsedError, { context: "api.response" });
				return Promise.reject(error);
			},
		);
	}

	/**
	 * Process queued requests after token refresh
	 * @private
	 */
	private _processQueue(error: unknown, token: string | null = null) {
		this.failedQueue.forEach((prom) => {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve(token ?? "");
			}
		});

		this.failedQueue = [];
	}

	/**
	 * Check if URL is login endpoint
	 * @private
	 * @param {string | undefined} url - Request URL
	 * @returns {boolean} Whether URL is login endpoint
	 */
	private _isLoginEndpoint(url: string | undefined) {
		return url?.includes("login") || url?.includes("register");
	}

	/**
	 * Check if URL is refresh endpoint
	 * @private
	 * @param {string | undefined} url - Request URL
	 * @returns {boolean} Whether URL is refresh endpoint
	 */
	private _isRefreshEndpoint(url: string | undefined) {
		return url?.includes("refresh");
	}

	/**
	 * Perform token refresh API call
	 * @private
	 * @param {string} refreshToken - Refresh token
	 * @returns {Promise} Refresh response with new tokens
	 */
	private async _performTokenRefresh(refreshToken: string) {
		return axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
			`${this.baseUrl}/auth/refresh`,
			{ refreshToken },
		);
	}

	/**
	 * Handle logout by clearing storage and redirecting to login
	 * @private
	 */
	private async _handleLogout() {
		await Promise.all([
			removeAuthToken(),
			removeUserData(),
			removeStorageItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY),
		]);

		router.replace(ROUTES.LOGIN);
	}

	// Proxy methods to axios instance
	get<T = unknown>(url: string, config?: AxiosRequestConfig) {
		return this.api.get<T>(url, config);
	}

	post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
		return this.api.post<T>(url, data, config);
	}

	put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
		return this.api.put<T>(url, data, config);
	}

	patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
		return this.api.patch<T>(url, data, config);
	}

	delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
		return this.api.delete<T>(url, config);
	}
}

export const apiService = new ApiService();
