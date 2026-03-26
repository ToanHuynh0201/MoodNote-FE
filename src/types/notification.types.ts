// Notification types (notifications feature)

export type NotificationType = "SYSTEM" | "REMINDER" | "STREAK";

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: NotificationType;
	isRead: boolean;
	readAt: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
}

export interface NotificationSettings {
	id: string;
	userId: string;
	reminderEnabled: boolean;
	reminderTime: string; // format: "HH:mm"
	reminderDays: number[]; // 1=Mon … 7=Sun (ISO weekday)
	createdAt: string;
	updatedAt: string;
}

export interface NotificationPagination {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Query params
export interface GetNotificationsParams {
	page?: number;
	limit?: number;
	isRead?: boolean;
	type?: NotificationType;
}

// Payloads
export interface UpdateNotificationSettingsPayload {
	reminderEnabled?: boolean;
	reminderTime?: string;
	reminderDays?: number[];
}

export interface RegisterDeviceTokenPayload {
	token: string;
	platform?: "android" | "ios";
}

export interface DeleteDeviceTokenPayload {
	token: string;
}

// Hook result types
export interface UseNotificationsResult {
	notifications: Notification[];
	pagination: NotificationPagination | null;
	unreadCount: number;
	isLoading: boolean;
	isRefreshing: boolean;
	isLoadingMore: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	loadMore: () => Promise<void>;
	markRead: (id: string) => Promise<void>;
	markAllRead: () => Promise<void>;
	deleteNotification: (id: string) => Promise<void>;
}

export interface UseNotificationSettingsResult {
	settings: NotificationSettings | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	updateSettings: (payload: UpdateNotificationSettingsPayload) => Promise<void>;
	registerDeviceToken: (payload: RegisterDeviceTokenPayload) => Promise<void>;
	deleteDeviceToken: (payload: DeleteDeviceTokenPayload) => Promise<void>;
}
