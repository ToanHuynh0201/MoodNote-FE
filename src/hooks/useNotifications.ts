// Hook for notification list, unread count, and per-notification actions

import { notificationService } from "@/services/notification.service";
import { useNotificationStore } from "@/store";
import type {
	Notification,
	NotificationPagination,
	UseNotificationsResult,
} from "@/types/notification.types";
import { logError } from "@/utils/error";
import { useCallback, useEffect, useState } from "react";

const PAGE_LIMIT = 20;

export function useNotifications(): UseNotificationsResult {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [pagination, setPagination] = useState<NotificationPagination | null>(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const { setUnreadCount: storeSetUnreadCount, decrementUnreadCount, resetUnreadCount } =
		useNotificationStore();
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	const fetchUnreadCount = useCallback(async () => {
		const result = await notificationService.getUnreadCount();
		if (result.success) {
			setUnreadCount(result.data.count);
			storeSetUnreadCount(result.data.count);
		}
	}, [storeSetUnreadCount]);

	const fetchPage = useCallback(async (page: number) => {
		const result = await notificationService.getAll({ page, limit: PAGE_LIMIT });
		if (!result.success) {
			throw new Error(result.error);
		}
		return result.data;
	}, []);

	// Initial load
	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const [data] = await Promise.all([fetchPage(1), fetchUnreadCount()]);
				setNotifications(data.notifications);
				setPagination(data.pagination);
				setCurrentPage(1);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An unexpected error occurred.");
			} finally {
				setIsLoading(false);
			}
		};
		void load();
	}, [fetchPage, fetchUnreadCount]);

	const refresh = useCallback(async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			const [data] = await Promise.all([fetchPage(1), fetchUnreadCount()]);
			setNotifications(data.notifications);
			setPagination(data.pagination);
			setCurrentPage(1);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred.");
		} finally {
			setIsRefreshing(false);
		}
	}, [fetchPage, fetchUnreadCount]);

	const loadMore = useCallback(async () => {
		if (isLoadingMore || !pagination || currentPage >= pagination.totalPages) return;
		setIsLoadingMore(true);
		try {
			const nextPage = currentPage + 1;
			const data = await fetchPage(nextPage);
			setNotifications((prev) => [...prev, ...data.notifications]);
			setPagination(data.pagination);
			setCurrentPage(nextPage);
		} catch (err) {
			logError(err, { context: "useNotifications.loadMore" });
		} finally {
			setIsLoadingMore(false);
		}
	}, [isLoadingMore, pagination, currentPage, fetchPage]);

	const markRead = useCallback(async (id: string) => {
		const result = await notificationService.markRead(id);
		if (!result.success) {
			logError(result.error, { context: "useNotifications.markRead" });
			return;
		}
		setNotifications((prev) =>
			prev.map((n) =>
				n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
			),
		);
		setUnreadCount((prev) => Math.max(0, prev - 1));
		decrementUnreadCount();
	}, [decrementUnreadCount]);

	const markAllRead = useCallback(async () => {
		const result = await notificationService.markAllRead();
		if (!result.success) {
			logError(result.error, { context: "useNotifications.markAllRead" });
			return;
		}
		setNotifications((prev) =>
			prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
		);
		setUnreadCount(0);
		resetUnreadCount();
	}, [resetUnreadCount]);

	const deleteNotification = useCallback(async (id: string) => {
		const result = await notificationService.deleteOne(id);
		if (!result.success) {
			logError(result.error, { context: "useNotifications.deleteNotification" });
			return;
		}
		setNotifications((prev) => {
			const removed = prev.find((n) => n.id === id);
			if (removed && !removed.isRead) {
				setUnreadCount((count) => Math.max(0, count - 1));
				decrementUnreadCount();
			}
			return prev.filter((n) => n.id !== id);
		});
		setPagination((prev) =>
			prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev,
		);
	}, [decrementUnreadCount]);

	return {
		notifications,
		pagination,
		unreadCount,
		isLoading,
		isRefreshing,
		isLoadingMore,
		error,
		refresh,
		loadMore,
		markRead,
		markAllRead,
		deleteNotification,
	};
}
