import { Stack } from "expo-router";
import { useEffect } from "react";

import { ProtectedRoute } from "@/components/navigation";
import { NetworkBanner, NotificationPopupProvider, useNotificationPopup } from "@/components/ui/feedback";
import { getInitialNotification, getMessaging, onMessage, onNotificationOpenedApp } from "@react-native-firebase/messaging";
import { useNotificationStore } from "@/store";
import { ROUTES } from "@/constants";
import { router } from "expo-router";
import { View } from "react-native";

// ─── Inner content (needs to be inside NotificationPopupProvider to use useNotificationPopup) ─────────

function AppContent() {
	const { show } = useNotificationPopup();
	const incrementUnreadCount = useNotificationStore((s) => s.incrementUnreadCount);

	useEffect(() => {
		// FR-21: Show in-app popup when a notification arrives in the foreground
		const unsubscribe = onMessage(getMessaging(), async (remoteMessage) => {
			show({
				title: remoteMessage.notification?.title,
				message: remoteMessage.notification?.body ?? "Bạn có thông báo mới",
				type: "info",
				duration: 5000,
			});
			incrementUnreadCount();
		});
		return unsubscribe;
	}, [show, incrementUnreadCount]);

	useEffect(() => {
		// FR-21: Navigate to notifications screen when user taps a notification while app is in background
		const unsubscribe = onNotificationOpenedApp(getMessaging(), () => {
			router.push(ROUTES.NOTIFICATIONS as never);
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		// FR-21: Navigate to notifications screen when app is opened from a quit state via notification tap
		getInitialNotification(getMessaging()).then((remoteMessage) => {
			if (remoteMessage) {
				router.push(ROUTES.NOTIFICATIONS as never);
			}
		});
	}, []);

	return (
		<View style={{ flex: 1 }}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen
					name="journal"
					options={{ animation: "slide_from_bottom" }}
				/>
				<Stack.Screen
					name="notifications"
					options={{ animation: "slide_from_right" }}
				/>
			</Stack>
			<NetworkBanner />
		</View>
	);
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout() {
	return (
		<ProtectedRoute>
			<NotificationPopupProvider>
				<AppContent />
			</NotificationPopupProvider>
		</ProtectedRoute>
	);
}
