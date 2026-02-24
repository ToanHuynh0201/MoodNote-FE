import { AUTH_CONFIG } from "@/constants";
import * as SecureStore from "expo-secure-store";

/**
 * Secure Storage utilities for handling encrypted data storage in React Native
 * Uses Expo SecureStore for secure, encrypted storage of sensitive data
 *
 * Security Features:
 * - Encrypted storage on both iOS (Keychain) and Android (EncryptedSharedPreferences)
 * - Hardware-backed security on supported devices
 * - Automatic encryption/decryption
 */

/**
 * Storage keys used throughout the app
 */

/**
 * Safely get item from SecureStore
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Promise<*>} Parsed value or default
 */
export const getStorageItem = async (key: string, defaultValue: any = null) => {
	try {
		const item = await SecureStore.getItemAsync(key);
		if (item) {
			try {
				return JSON.parse(item);
			} catch {
				// If parsing fails, return the raw string
				return item;
			}
		}
		return defaultValue;
	} catch (error) {
		console.warn(`Error reading SecureStore key "${key}":`, error);
		return defaultValue;
	}
};

/**
 * Safely set item in SecureStore
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be stringified)
 * @returns {Promise<boolean>} Success status
 */
export const setStorageItem = async (key: string, value: any) => {
	try {
		const stringValue =
			typeof value === "string" ? value : JSON.stringify(value);
		await SecureStore.setItemAsync(key, stringValue);
		return true;
	} catch (error) {
		console.warn(`Error writing to SecureStore key "${key}":`, error);
		return false;
	}
};

/**
 * Safely remove item from SecureStore
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
export const removeStorageItem = async (key: string) => {
	try {
		await SecureStore.deleteItemAsync(key);
		return true;
	} catch (error) {
		console.warn(`Error removing SecureStore key "${key}":`, error);
		return false;
	}
};

/**
 * Clear specific storage items
 * @param {string[]} keys - Array of keys to remove
 * @returns {Promise<boolean>} Success status
 */
export const clearStorageItems = async (keys: string[]) => {
	try {
		await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
		return true;
	} catch (error) {
		console.warn("Error clearing SecureStore items:", error);
		return false;
	}
};

/**
 * Check if SecureStore is available
 * @returns {Promise<boolean>} Availability status
 */
export const isStorageAvailable = async (): Promise<boolean> => {
	try {
		const test = "__storage_test__";
		await SecureStore.setItemAsync(test, test);
		await SecureStore.deleteItemAsync(test);
		return true;
	} catch {
		return false;
	}
};

/**
 * Clear all sensitive data from SecureStore
 * This removes all known app keys
 * @returns {Promise<boolean>} Success status
 */
export const clearStorage = async () => {
	try {
		const keys = [
			AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY,
			AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
			AUTH_CONFIG.USER_STORAGE_KEY,
		];
		await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
		return true;
	} catch (error) {
		console.warn("Error clearing all SecureStore:", error);
		return false;
	}
};

/**
 * Store authentication token securely
 * @param {string} token - Authentication token
 * @returns {Promise<boolean>} Success status
 */
export const setAuthToken = async (token: string) => {
	return await setStorageItem(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY, token);
};

/**
 * Get authentication token
 * @returns {Promise<string | null>} Authentication token or null
 */
export const getAuthToken = async (): Promise<string | null> => {
	return getStorageItem(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY, null);
};

/**
 * Remove authentication token
 * @returns {Promise<boolean>} Success status
 */
export const removeAuthToken = async () => {
	return removeStorageItem(AUTH_CONFIG.ACCESS_TOKEN_STORAGE_KEY);
};

/**
 * Store user data securely
 * @param {object} userData - User data object
 * @returns {Promise<boolean>} Success status
 */
export const setUserData = async (userData: any) => {
	return setStorageItem(AUTH_CONFIG.USER_STORAGE_KEY, userData);
};

/**
 * Get user data
 * @returns {Promise<object | null>} User data or null
 */
export const getUserData = async (): Promise<any> => {
	return getStorageItem(AUTH_CONFIG.USER_STORAGE_KEY, null);
};

/**
 * Remove user data
 * @returns {Promise<boolean>} Success status
 */
export const removeUserData = async () => {
	return removeStorageItem(AUTH_CONFIG.USER_STORAGE_KEY);
};
