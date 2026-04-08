// NFR-04: Offline support types

export type SyncStatus =
	| "synced"
	| "pending_create"
	| "pending_update"
	| "pending_delete";

/** Raw row as stored in SQLite (JSON columns not yet parsed) */
export interface LocalEntryRow {
	local_id: string;
	server_id: string | null;
	title: string | null;
	content: string; // JSON string → parse to QuillDelta
	entry_date: string;
	input_method: string;
	tags: string; // JSON string → parse to string[]
	word_count: number;
	is_private: number; // 0 | 1
	analysis_status: string;
	emotion_analysis: string | null; // JSON string → parse to EmotionAnalysis, or null
	sync_status: SyncStatus;
	content_fetched: number; // 0 = stub (list sync), 1 = full content
	retry_count: number; // NFR-18: incremented on each failed sync attempt, capped at MAX_RETRY
	created_at: string;
	updated_at: string;
}

/** Typed input for entryRepository.insertEntry */
export interface LocalEntry {
	local_id: string;
	server_id?: string;
	title?: string;
	content: string; // JSON string
	entry_date: string;
	input_method: string;
	tags: string; // JSON string
	word_count: number;
	is_private: number; // 0 | 1
	analysis_status: string;
	emotion_analysis?: string | null; // JSON string of EmotionAnalysis, or null
	sync_status: SyncStatus;
	content_fetched?: number; // 0 = stub, 1 = full content (default 0)
	created_at: string;
	updated_at: string;
}

/** Patch fields for entryRepository.updateEntry */
export interface EntryUpdatePatch {
	title?: string | null;
	content?: string; // JSON string
	tags?: string; // JSON string
	word_count?: number;
	updated_at: string;
}
