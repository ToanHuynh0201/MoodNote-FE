import { Stack } from "expo-router";

import { ProtectedRoute } from "@/components/navigation";

export default function AppLayout() {
	return (
		<ProtectedRoute>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="journal" />
			</Stack>
		</ProtectedRoute>
	);
}
