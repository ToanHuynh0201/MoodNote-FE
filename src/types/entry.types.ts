// FR-06, FR-08, FR-09: Journal entry types

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type MusicStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
export type InputMethod = "TEXT" | "VOICE";

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
	musicStatus: MusicStatus;
	emotionAnalysis: EmotionAnalysis | null;
	createdAt: string;
	updatedAt: string;
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
	musicStatus: MusicStatus;
	/** Spec: always null in list response — use GET /entries/:id for full analysis */
	emotionAnalysis: null;
	createdAt: string;
	updatedAt: string;
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
	removeEntry: (id: string) => Promise<void>;
}

export interface UseEntryResult {
	entry: Entry | null;
	isLoading: boolean;
	error: string | null;
	updateEntry: (payload: UpdateEntryPayload) => Promise<Entry>;
	deleteEntry: () => Promise<void>;
}
