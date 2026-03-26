import { create } from "zustand";

interface NotificationStore {
	unreadCount: number;
	setUnreadCount: (count: number) => void;
	incrementUnreadCount: () => void;
	decrementUnreadCount: () => void;
	resetUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
	unreadCount: 0,
	setUnreadCount: (count) => set({ unreadCount: count }),
	incrementUnreadCount: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
	decrementUnreadCount: () =>
		set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
	resetUnreadCount: () => set({ unreadCount: 0 }),
}));
