// Notification API calls (notifications feature)

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
	DeleteDeviceTokenPayload,
	GetNotificationsParams,
	Notification,
	NotificationPagination,
	NotificationSettings,
	RegisterDeviceTokenPayload,
	UpdateNotificationSettingsPayload,
} from "@/types/notification.types";
import { withErrorHandling } from "@/utils/error";

export const notificationService = {
	// Get paginated notification list
	getAll: withErrorHandling((params?: GetNotificationsParams) =>
		api.get<
			ApiResponse<{
				notifications: Notification[];
				pagination: NotificationPagination;
			}>
		>("/notifications", { params }),
	),

	// Get unread notification count
	getUnreadCount: withErrorHandling(() =>
		api.get<ApiResponse<{ count: number }>>("/notifications/unread-count"),
	),

	// Mark all notifications as read
	markAllRead: withErrorHandling(() =>
		api.patch<ApiResponse<{ updated: number }>>("/notifications/read-all"),
	),

	// Mark a single notification as read
	markRead: withErrorHandling((id: string) =>
		api.patch<ApiResponse<null>>(`/notifications/${id}/read`),
	),

	// Delete a single notification
	deleteOne: withErrorHandling((id: string) =>
		api.delete<ApiResponse<null>>(`/notifications/${id}`),
	),

	// Get reminder settings (auto-created with defaults if not exists)
	getSettings: withErrorHandling(() =>
		api.get<ApiResponse<{ settings: NotificationSettings }>>("/notifications/settings"),
	),

	// Update reminder settings
	updateSettings: withErrorHandling((payload: UpdateNotificationSettingsPayload) =>
		api.patch<ApiResponse<{ settings: NotificationSettings }>>(
			"/notifications/settings",
			payload,
		),
	),

	// Register FCM device token (upsert)
	registerDeviceToken: withErrorHandling((payload: RegisterDeviceTokenPayload) =>
		api.post<ApiResponse<null>>("/notifications/device-token", payload),
	),

	// Remove FCM device token
	deleteDeviceToken: withErrorHandling((payload: DeleteDeviceTokenPayload) =>
		api.delete<ApiResponse<null>>("/notifications/device-token", { data: payload }),
	),
};
