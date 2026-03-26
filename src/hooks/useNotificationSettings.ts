// Hook for reminder settings and FCM device token management

import { notificationService } from "@/services/notification.service";
import type {
	DeleteDeviceTokenPayload,
	NotificationSettings,
	RegisterDeviceTokenPayload,
	UpdateNotificationSettingsPayload,
	UseNotificationSettingsResult,
} from "@/types/notification.types";
import { logError } from "@/utils/error";
import { useCallback, useEffect, useState } from "react";

export function useNotificationSettings(): UseNotificationSettingsResult {
	const [settings, setSettings] = useState<NotificationSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			setError(null);
			const result = await notificationService.getSettings();
			if (result.success) {
				setSettings(result.data.settings);
			} else {
				setError(result.error);
				logError(result.error, { context: "useNotificationSettings.load" });
			}
			setIsLoading(false);
		};
		void load();
	}, []);

	const updateSettings = useCallback(async (payload: UpdateNotificationSettingsPayload) => {
		setIsSaving(true);
		const result = await notificationService.updateSettings(payload);
		if (result.success) {
			setSettings(result.data.settings);
		} else {
			logError(result.error, { context: "useNotificationSettings.updateSettings" });
			throw new Error(result.error);
		}
		setIsSaving(false);
	}, []);

	const registerDeviceToken = useCallback(async (payload: RegisterDeviceTokenPayload) => {
		const result = await notificationService.registerDeviceToken(payload);
		if (!result.success) {
			logError(result.error, { context: "useNotificationSettings.registerDeviceToken" });
		}
	}, []);

	const deleteDeviceToken = useCallback(async (payload: DeleteDeviceTokenPayload) => {
		const result = await notificationService.deleteDeviceToken(payload);
		if (!result.success) {
			logError(result.error, { context: "useNotificationSettings.deleteDeviceToken" });
		}
	}, []);

	return {
		settings,
		isLoading,
		isSaving,
		error,
		updateSettings,
		registerDeviceToken,
		deleteDeviceToken,
	};
}
