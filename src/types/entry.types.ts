// FR-06, FR-08, FR-09: Journal entry types

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type InputMethod = "TEXT" | "VOICE";

// ─── Quill Delta format (FR-06: content format) ─────────────────────────────

export interface DeltaOp {
	insert: string;
	attributes?: Record<string, unknown>;
}

export interface QuillDelta {
	ops: DeltaOp[];
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
