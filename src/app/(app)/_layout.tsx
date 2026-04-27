import { Stack } from "expo-router";
import { useEffect } from "react";

import { LockScreen } from "@/components/appLock";
import { ProtectedRoute } from "@/components/navigation";
import { NotificationPopupProvider, useNotificationPopup } from "@/components/ui/feedback";
import { ROUTES } from "@/constants";
import { getInitialNotification, getMessaging, onMessage, onNotificationOpenedApp } from "@react-native-firebase/messaging";
import { useAppLockStore, useNotificationStore } from "@/store";
import { router } from "expo-router";
import { AppState, View } from "react-native";

// ─── Inner content (needs to be inside NotificationPopupProvider to use useNotificationPopup) ─────────

function AppContent() {
	const { show } = useNotificationPopup();
	const incrementUnreadCount = useNotificationStore((s) => s.incrementUnreadCount);
	const appLockInitialize = useAppLockStore((s) => s.initialize);
	const onBackground = useAppLockStore((s) => s.onBackground);
	const onForeground = useAppLockStore((s) => s.onForeground);

	useEffect(() => {
		void appLockInitialize();
	}, [appLockInitialize]);

	useEffect(() => {
		const sub = AppState.addEventListener("change", (nextState) => {
			if (nextState === "background" || nextState === "inactive") {
				onBackground();
			} else if (nextState === "active") {
				onForeground();
			}
		});
		return () => sub.remove();
	}, [onBackground, onForeground]);

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
				<Stack.Screen
					name="privacy"
					options={{ animation: "slide_from_right" }}
				/>
			</Stack>
			<LockScreen />
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
