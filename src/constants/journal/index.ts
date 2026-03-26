import { actions } from "react-native-pell-rich-editor";

export const TOOLBAR_ACTIONS = [
	actions.heading1,
	actions.heading2,
	actions.setBold,
	actions.setItalic,
	actions.insertBulletsList,
	actions.insertOrderedList,
];

export const ANALYSIS_STATUS_LABELS: Record<string, string> = {
	PENDING: "Chờ phân tích",
	PROCESSING: "Đang phân tích",
	COMPLETED: "Đã phân tích",
	FAILED: "Phân tích lỗi",
};

export const SYNC_STATUS_LABELS: Record<string, string> = {
	synced: "Đã đồng bộ",
	pending_create: "Chưa tải lên",
	pending_update: "Chờ cập nhật",
	pending_delete: "Chờ xóa",
};

export const SYNC_STATUS_ICONS: Record<string, string> = {
	synced: "checkmark-circle-outline",
	pending_create: "cloud-upload-outline",
	pending_update: "sync-outline",
	pending_delete: "trash-outline",
};
