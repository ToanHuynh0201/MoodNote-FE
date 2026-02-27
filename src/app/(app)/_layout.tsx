import { Redirect, Stack } from "expo-router";

import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";

// Auth guard: redirects unauthenticated users to login
export default function AppLayout() {
	const { isAuthenticated, isLoading } = useAuth();

	// Wait for session restore before deciding
	if (isLoading) return null;

	if (!isAuthenticated && !__DEV__) {
		return <Redirect href={ROUTES.LOGIN} />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	);
}
