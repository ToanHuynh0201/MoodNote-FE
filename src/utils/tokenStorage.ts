// Wrapper around expo-secure-store for token management
// TODO: Install expo-secure-store: npx expo install expo-secure-store

// import * as SecureStore from 'expo-secure-store'

export async function getToken(key: string): Promise<string | null> {
	// TODO: return await SecureStore.getItemAsync(key)
	return null;
}

export async function setToken(key: string, value: string): Promise<void> {
	// TODO: await SecureStore.setItemAsync(key, value)
}

export async function deleteToken(key: string): Promise<void> {
	// TODO: await SecureStore.deleteItemAsync(key)
}
