// FR-06, FR-08, FR-09: Journal entry types

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type InputMethod = "TEXT" | "VOICE";

// Re-export for convenience — components only need @/types
export type { SyncStatus } from "./offline.types";

// ─── Quill Delta format (FR-06: content format) ─────────────────────────────

export interface DeltaOp {
	insert: string;
	attributes?: Record<string, unknown>;
}

export interface QuillDelta {
	ops: DeltaOp[];
}

// ─── Emotion analysis types (FR-10) ─────────────────────────────────────────

export type EmotionType =
	| "Enjoyment"
	| "Sadness"
	| "Anger"
	| "Fear"
	| "Disgust"
	| "Surprise"
	| "Other";

export interface EmotionAnalysis {
	id: string;
	entryId: string;
	primaryEmotion: EmotionType;
	sentimentScore: number; // -1.0 to +1.0
	intensity: number; // 0.0–100.0
	confidence: number | null;
	emotionDistribution: Record<EmotionType, number> | null;
	keywords: string[];
	modelVersion: string | null;
	analyzedAt: string;
	createdAt: string;
}

// ─── Entry entities ──────────────────────────────────────────────────────────

/** Full entry — returned by POST /entries, GET /entries/:id, PATCH /entries/:id */
export interface Entry {
	id: string;
	title: string | null;
	content: QuillDelta;
	entryDate: string;
	inputMethod: InputMethod;
	tags: string[];
	wordCount: number;
	isPrivate: boolean;
	analysisStatus: AnalysisStatus;
	emotionAnalysis: EmotionAnalysis | null;
	createdAt: string;
	updatedAt: string;
	// NFR-04: offline fields (present on local-first entries)
	isOffline?: boolean;
	syncStatus?: import("./offline.types").SyncStatus;
	/** True when full QuillDelta content has been stored locally; false for list-sync stubs */
	contentFetched?: boolean;
}

/** Partial emotion analysis returned inline with list items */
export interface EntryListEmotionAnalysis {
	primaryEmotion: EmotionType;
	sentimentScore: number;
}

/** List item — returned by GET /entries (preview instead of full content) */
export interface EntryListItem {
	id: string;
	title: string | null;
	preview: string;
	entryDate: string;
	inputMethod: InputMethod;
	tags: string[];
	wordCount: number;
	isPrivate: boolean;
	analysisStatus: AnalysisStatus;
	/** Present when analysisStatus === "COMPLETED", null otherwise */
	emotionAnalysis: EntryListEmotionAnalysis | null;
	createdAt: string;
	updatedAt: string;
	// NFR-04: offline fields
	isOffline: boolean;
	syncStatus: import("./offline.types").SyncStatus;
}

/** Pagination metadata from GET /entries response */
export interface EntryPagination {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// ─── Service payloads ────────────────────────────────────────────────────────

export interface CreateEntryPayload {
	title?: string;
	content: QuillDelta;
	entryDate?: string; // YYYY-MM-DD, defaults to today
	inputMethod?: InputMethod;
	tags?: string[];
	isPrivate?: boolean;
}

export interface UpdateEntryPayload {
	title?: string;
	content?: QuillDelta;
	tags?: string[];
	isPrivate?: boolean;
}

/** Query params for GET /entries */
export interface GetEntriesParams {
	page?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
	tags?: string; // comma-separated
	analysisStatus?: AnalysisStatus;
}

// ─── Hook result types ────────────────────────────────────────────────────────

export interface UseEntriesResult {
	entries: EntryListItem[];
	pagination: EntryPagination | null;
	isLoading: boolean;
	isRefreshing: boolean;
	isLoadingMore: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	loadMore: () => Promise<void>;
	/** Removes entry from local DB and server (if online). Returns after local write. */
	removeEntry: (id: string) => Promise<void>;
}

export interface UseEntryResult {
	entry: Entry | null;
	isLoading: boolean;
	error: string | null;
	/** Server-side UUID (null if entry has never been synced) */
	serverId: string | null;
	/** Updates entry locally first, then syncs to server if online */
	updateEntry: (payload: UpdateEntryPayload) => Promise<Entry>;
	/** Deletes entry from local DB and server (if online). Throws on local error. */
	deleteEntry: () => Promise<void>;
}
