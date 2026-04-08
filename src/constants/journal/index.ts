import { actions } from "react-native-pell-rich-editor";

import type { AnalysisStatus, EmotionType } from "@/types";

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

// FR-10: Emotion type display labels
export const EMOTION_TYPE_LABELS: Record<string, string> = {
	Enjoyment: "Vui vẻ",
	Sadness: "Buồn bã",
	Anger: "Tức giận",
	Fear: "Sợ hãi",
	Disgust: "Chán ghét",
	Surprise: "Ngạc nhiên",
	Other: "Khác",
};

// FR-11: Sentiment score classifications (-1.0 to +1.0)
export const SENTIMENT_LABELS: { max: number; label: string }[] = [
	{ max: -0.6, label: "Rất tiêu cực" },
	{ max: -0.2, label: "Tiêu cực" },
	{ max: 0.2, label: "Trung tính" },
	{ max: 0.6, label: "Tích cực" },
	{ max: 1.0, label: "Rất tích cực" },
];

// FR-12: Intensity classifications (0–100)
export const INTENSITY_LABELS: { max: number; label: string }[] = [
	{ max: 20, label: "Rất nhẹ" },
	{ max: 40, label: "Nhẹ" },
	{ max: 60, label: "Trung bình" },
	{ max: 80, label: "Mạnh" },
	{ max: 100, label: "Rất mạnh" },
];

// Emotion type → emoji mapping (used in statistics and home screens)
export const EMOTION_EMOJI: Record<EmotionType, string> = {
	Enjoyment: "😊",
	Sadness: "😢",
	Anger: "😠",
	Fear: "😨",
	Disgust: "🤢",
	Surprise: "😲",
	Other: "😐",
};

export const ANALYSIS_POLL_INTERVAL_MS = 3000;

export const ANALYSIS_POLLING_STATUSES: AnalysisStatus[] = ["PENDING", "PROCESSING"];
