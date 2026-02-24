// Axios instance with request/response interceptors
// - Request: attach Authorization header from secure storage
// - Response 401: attempt token refresh, retry original request; on failure → logout
//
// TODO: Install axios before using: npx expo install axios
// import axios from 'axios'

import { API_BASE_URL, TOKEN_KEYS } from "@/constants/Config";
import { deleteToken, getToken, setToken } from "@/utils/tokenStorage";

// Stub type until axios is installed
type AxiosInstance = {
	get: <T = unknown>(url: string, config?: object) => Promise<{ data: T }>;
	post: <T = unknown>(
		url: string,
		data?: unknown,
		config?: object,
	) => Promise<{ data: T }>;
	patch: <T = unknown>(
		url: string,
		data?: unknown,
		config?: object,
	) => Promise<{ data: T }>;
	delete: <T = unknown>(url: string, config?: object) => Promise<{ data: T }>;
	interceptors: {
		request: { use: (fn: unknown, errFn?: unknown) => void };
		response: { use: (fn: unknown, errFn?: unknown) => void };
	};
};

// TODO: Replace stub with real axios instance once installed:
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: { 'Content-Type': 'application/json' },
// })

const api: AxiosInstance = {
	get: async () => {
		throw new Error("Install axios: npx expo install axios");
	},
	post: async () => {
		throw new Error("Install axios: npx expo install axios");
	},
	patch: async () => {
		throw new Error("Install axios: npx expo install axios");
	},
	delete: async () => {
		throw new Error("Install axios: npx expo install axios");
	},
	interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

// --- Request interceptor stub (activate after installing axios) ---
// api.interceptors.request.use(
//   async (config) => {
//     const token = await getToken(TOKEN_KEYS.ACCESS_TOKEN)
//     if (token) config.headers.Authorization = `Bearer ${token}`
//     return config
//   },
//   (error) => Promise.reject(error),
// )

// --- Response interceptor stub (activate after installing axios) ---
// let isRefreshing = false
// let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (r?: unknown) => void }> = []
//
// function processQueue(error: unknown, token: string | null = null) {
//   failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
//   failedQueue = []
// }
//
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config
//     if (error.response?.status !== 401 || originalRequest._retry) return Promise.reject(error)
//     if (isRefreshing) {
//       return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then(
//         (token) => { originalRequest.headers.Authorization = `Bearer ${token}`; return api(originalRequest) },
//       )
//     }
//     originalRequest._retry = true
//     isRefreshing = true
//     try {
//       const refreshToken = await getToken(TOKEN_KEYS.REFRESH_TOKEN)
//       if (!refreshToken) throw new Error('No refresh token')
//       const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
//       const newToken: string = data.data.accessToken
//       await setToken(TOKEN_KEYS.ACCESS_TOKEN, newToken)
//       processQueue(null, newToken)
//       originalRequest.headers.Authorization = `Bearer ${newToken}`
//       return api(originalRequest)
//     } catch (err) {
//       processQueue(err, null)
//       await deleteToken(TOKEN_KEYS.ACCESS_TOKEN)
//       await deleteToken(TOKEN_KEYS.REFRESH_TOKEN)
//       return Promise.reject(err)
//     } finally { isRefreshing = false }
//   },
// )

// Suppress unused import warnings until axios is installed
void API_BASE_URL;
void getToken;
void setToken;
void deleteToken;
void TOKEN_KEYS;

export default api;
