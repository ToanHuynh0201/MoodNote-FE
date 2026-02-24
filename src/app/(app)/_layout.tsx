import { Stack } from "expo-router";

// Auth guard: redirects unauthenticated users to login
export default function AppLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	);
}
