// NFR-04: All SQL operations against the entries table

import type {
	EmotionAnalysis,
	EntryListItem,
	Entry,
	EntryUpdatePatch,
	LocalEntry,
	LocalEntryRow,
	SyncStatus,
} from "@/types";
import { getDb } from "./database";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rowToListItem(row: LocalEntryRow): EntryListItem {
	const tags = JSON.parse(row.tags) as string[];
	const isOffline = row.sync_status !== "synced";
	return {
		id: row.local_id,
		title: row.title,
		preview: row.content
			? (() => {
					try {
						const delta = JSON.parse(row.content) as {
							ops: Array<{ insert?: string }>;
						};
						return delta.ops
							.map((op) => (typeof op.insert === "string" ? op.insert : ""))
							.join("")
							.trim()
							.slice(0, 200);
					} catch {
						return "";
					}
				})()
			: "",
		entryDate: row.entry_date,
		inputMethod: row.input_method as Entry["inputMethod"],
		tags,
		wordCount: row.word_count,
		isPrivate: row.is_private === 1,
		analysisStatus: row.analysis_status as Entry["analysisStatus"],
		emotionAnalysis: (() => {
			if (!row.emotion_analysis) return null;
			try {
				const parsed = JSON.parse(row.emotion_analysis) as EmotionAnalysis;
				return { primaryEmotion: parsed.primaryEmotion, sentimentScore: parsed.sentimentScore };
			} catch {
				return null;
			}
		})(),
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		isOffline,
		syncStatus: row.sync_status,
	};
}

function rowToEntry(row: LocalEntryRow): Entry {
	const tags = JSON.parse(row.tags) as string[];
	const content = JSON.parse(row.content) as Entry["content"];
	const isOffline = row.sync_status !== "synced";
	const emotionAnalysis = row.emotion_analysis
		? (JSON.parse(row.emotion_analysis) as EmotionAnalysis)
		: null;
	return {
		id: row.local_id,
		title: row.title,
		content,
		entryDate: row.entry_date,
		inputMethod: row.input_method as Entry["inputMethod"],
		tags,
		wordCount: row.word_count,
		isPrivate: row.is_private === 1,
		analysisStatus: row.analysis_status as Entry["analysisStatus"],
		emotionAnalysis,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		isOffline,
		syncStatus: row.sync_status,
		contentFetched: row.content_fetched === 1,
	};
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function insertEntry(entry: LocalEntry): Promise<void> {
	const db = getDb();
	await db.runAsync(
		`INSERT INTO entries
      (local_id, server_id, title, content, entry_date, input_method, tags,
       word_count, is_private, analysis_status, sync_status, content_fetched, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		entry.local_id,
		entry.server_id ?? null,
		entry.title ?? null,
		entry.content,
		entry.entry_date,
		entry.input_method,
		entry.tags,
		entry.word_count,
		entry.is_private,
		entry.analysis_status,
		entry.sync_status,
		1, // locally created entries always have full content
		entry.created_at,
		entry.updated_at,
	);
}

export async function getAllEntries(): Promise<EntryListItem[]> {
	const db = getDb();
	const rows = await db.getAllAsync<LocalEntryRow>(
		`SELECT * FROM entries
     WHERE sync_status != 'pending_delete'
     ORDER BY entry_date DESC, created_at DESC`,
	);
	return rows.map(rowToListItem);
}

export async function getEntryById(localId: string): Promise<Entry | null> {
	const db = getDb();
	const row = await db.getFirstAsync<LocalEntryRow>(
		`SELECT * FROM entries WHERE local_id = ?`,
		localId,
	);
	return row ? rowToEntry(row) : null;
}

export async function updateEntry(
	localId: string,
	patch: EntryUpdatePatch,
): Promise<void> {
	const db = getDb();
	// Build SET clause dynamically for only provided fields
	const sets: string[] = [];
	const values: (string | number | null)[] = [];

	if (patch.title !== undefined) {
		sets.push("title = ?");
		values.push(patch.title);
	}
	if (patch.content !== undefined) {
		sets.push("content = ?");
		values.push(patch.content);
	}
	if (patch.tags !== undefined) {
		sets.push("tags = ?");
		values.push(patch.tags);
	}
	if (patch.word_count !== undefined) {
		sets.push("word_count = ?");
		values.push(patch.word_count);
	}

	// Preserve pending_create — don't downgrade to pending_update
	sets.push(
		"sync_status = CASE WHEN sync_status = 'pending_create' THEN 'pending_create' ELSE 'pending_update' END",
	);
	sets.push("updated_at = ?");
	values.push(patch.updated_at, localId);

	await db.runAsync(
		`UPDATE entries SET ${sets.join(", ")} WHERE local_id = ?`,
		...values,
	);
}

export async function markEntryDeleted(localId: string): Promise<void> {
	const db = getDb();
	const row = await db.getFirstAsync<{ sync_status: SyncStatus }>(
		`SELECT sync_status FROM entries WHERE local_id = ?`,
		localId,
	);
	if (!row) return;

	if (row.sync_status === "pending_create") {
		// Never reached server — safe to hard-delete
		await db.runAsync(`DELETE FROM entries WHERE local_id = ?`, localId);
	} else {
		await db.runAsync(
			`UPDATE entries SET sync_status = 'pending_delete' WHERE local_id = ?`,
			localId,
		);
	}
}

export async function hardDeleteEntry(localId: string): Promise<void> {
	const db = getDb();
	await db.runAsync(`DELETE FROM entries WHERE local_id = ?`, localId);
}

// ─── Sync helpers ─────────────────────────────────────────────────────────────

export async function getPendingEntries(): Promise<LocalEntryRow[]> {
	const db = getDb();
	return db.getAllAsync<LocalEntryRow>(
		`SELECT * FROM entries
     WHERE sync_status != 'synced'
     ORDER BY created_at ASC`,
	);
}

export async function markSynced(
	localId: string,
	serverId: string,
	analysisStatus?: string,
): Promise<void> {
	const db = getDb();
	await db.runAsync(
		`UPDATE entries
     SET server_id = ?, sync_status = 'synced', analysis_status = COALESCE(?, analysis_status)
     WHERE local_id = ?`,
		serverId,
		analysisStatus ?? null,
		localId,
	);
}

export async function markUpdateSynced(localId: string): Promise<void> {
	const db = getDb();
	await db.runAsync(
		`UPDATE entries SET sync_status = 'synced' WHERE local_id = ?`,
		localId,
	);
}

// ─── Server sync (upsert from server response) ───────────────────────────────

/** Upsert a full Entry from server. Local wins: never overwrite pending_* rows. */
export async function upsertFromServer(serverEntry: Entry): Promise<void> {
	const db = getDb();
	const existing = await db.getFirstAsync<{
		local_id: string;
		sync_status: SyncStatus;
	}>(
		`SELECT local_id, sync_status FROM entries WHERE server_id = ?`,
		serverEntry.id,
	);

	const contentJson = JSON.stringify(serverEntry.content);
	const tagsJson = JSON.stringify(serverEntry.tags);
	const emotionAnalysisJson = serverEntry.emotionAnalysis
		? JSON.stringify(serverEntry.emotionAnalysis)
		: null;

	if (!existing) {
		// New from server — insert as synced, local_id = server_id
		await db.runAsync(
			`INSERT OR IGNORE INTO entries
        (local_id, server_id, title, content, entry_date, input_method, tags,
         word_count, is_private, analysis_status, emotion_analysis, sync_status, content_fetched, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', 1, ?, ?)`,
			serverEntry.id,
			serverEntry.id,
			serverEntry.title,
			contentJson,
			serverEntry.entryDate,
			serverEntry.inputMethod,
			tagsJson,
			serverEntry.wordCount,
			serverEntry.isPrivate ? 1 : 0,
			serverEntry.analysisStatus,
			emotionAnalysisJson,
			serverEntry.createdAt,
			serverEntry.updatedAt,
		);
	} else if (existing.sync_status === "synced") {
		// No local pending changes — safe to take server version
		await db.runAsync(
			`UPDATE entries
       SET title = ?, content = ?, entry_date = ?, tags = ?,
           word_count = ?, is_private = ?, analysis_status = ?, emotion_analysis = ?,
           content_fetched = 1, updated_at = ?
       WHERE local_id = ?`,
			serverEntry.title,
			contentJson,
			serverEntry.entryDate,
			tagsJson,
			serverEntry.wordCount,
			serverEntry.isPrivate ? 1 : 0,
			serverEntry.analysisStatus,
			emotionAnalysisJson,
			serverEntry.updatedAt,
			existing.local_id,
		);
	}
	// else: pending_* — local wins, skip
}

/** Upsert list items from server (no full content — only list-visible fields). */
export async function upsertListFromServer(
	items: Omit<EntryListItem, "isOffline" | "syncStatus">[],
): Promise<void> {
	const db = getDb();

	for (const item of items) {
		const existing = await db.getFirstAsync<{
			local_id: string;
			sync_status: SyncStatus;
		}>(
			`SELECT local_id, sync_status FROM entries WHERE server_id = ?`,
			item.id,
		);

		const tagsJson = JSON.stringify(item.tags);

		if (!existing) {
			// Insert as synced placeholder (no full content — use preview as stub)
			await db.runAsync(
				`INSERT OR IGNORE INTO entries
          (local_id, server_id, title, content, entry_date, input_method, tags,
           word_count, is_private, analysis_status, sync_status, content_fetched, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', 0, ?, ?)`,
				item.id,
				item.id,
				item.title,
				JSON.stringify({ ops: [{ insert: item.preview }] }),
				item.entryDate,
				item.inputMethod,
				tagsJson,
				item.wordCount,
				item.isPrivate ? 1 : 0,
				item.analysisStatus,
				item.createdAt,
				item.updatedAt,
			);
		} else if (existing.sync_status === "synced") {
			await db.runAsync(
				`UPDATE entries
         SET title = ?, entry_date = ?, tags = ?,
             word_count = ?, is_private = ?, analysis_status = ?,
             updated_at = ?
         WHERE local_id = ?`,
				item.title,
				item.entryDate,
				tagsJson,
				item.wordCount,
				item.isPrivate ? 1 : 0,
				item.analysisStatus,
				item.updatedAt,
				existing.local_id,
			);
		}
		// pending_* → local wins, skip
	}
}

/** Update analysis_status (and optionally emotionAnalysis) for a synced entry (e.g. polling result). */
export async function updateAnalysisStatus(
	localId: string,
	status: string,
	emotionAnalysis?: EmotionAnalysis | null,
): Promise<void> {
	const db = getDb();
	const emotionAnalysisJson =
		emotionAnalysis !== undefined
			? (emotionAnalysis ? JSON.stringify(emotionAnalysis) : null)
			: undefined;

	if (emotionAnalysisJson !== undefined) {
		await db.runAsync(
			`UPDATE entries SET analysis_status = ?, emotion_analysis = ? WHERE local_id = ?`,
			status,
			emotionAnalysisJson,
			localId,
		);
	} else {
		await db.runAsync(
			`UPDATE entries SET analysis_status = ? WHERE local_id = ?`,
			status,
			localId,
		);
	}
}

/** Marks an entry as having full content (not a stub). */
export async function markContentFetched(localId: string): Promise<void> {
	const db = getDb();
	await db.runAsync(
		`UPDATE entries SET content_fetched = 1 WHERE local_id = ?`,
		localId,
	);
}

/** Increment retry_count for a pending entry (called on sync failure). */
export async function incrementRetryCount(localId: string): Promise<void> {
	const db = getDb();
	await db.runAsync(
		`UPDATE entries SET retry_count = retry_count + 1 WHERE local_id = ?`,
		localId,
	);
}

/** Reset retry_count to 0 for a specific entry (called on sync success). */
export async function resetRetryCount(localId: string): Promise<void> {
	const db = getDb();
	await db.runAsync(
		`UPDATE entries SET retry_count = 0 WHERE local_id = ?`,
		localId,
	);
}

/** Return entries that have exceeded the retry limit (retry_count >= maxRetry). */
export async function getMaxRetryEntries(maxRetry: number): Promise<LocalEntryRow[]> {
	const db = getDb();
	return db.getAllAsync<LocalEntryRow>(
		`SELECT * FROM entries WHERE sync_status != 'synced' AND retry_count >= ?`,
		maxRetry,
	);
}

/** Reset retry_count for all max-retry entries so they can be retried again. */
export async function resetAllRetryCount(maxRetry: number): Promise<void> {
	const db = getDb();
	await db.runAsync(
		`UPDATE entries SET retry_count = 0 WHERE sync_status != 'synced' AND retry_count >= ?`,
		maxRetry,
	);
}

/** Returns server_id for a local entry (null if never synced). */
export async function getEntryServerId(
	localId: string,
): Promise<string | null> {
	const db = getDb();
	const row = await db.getFirstAsync<{ server_id: string | null }>(
		`SELECT server_id FROM entries WHERE local_id = ?`,
		localId,
	);
	return row?.server_id ?? null;
}
