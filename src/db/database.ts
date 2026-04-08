// NFR-04: SQLite database setup and migrations

import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
	// openDatabaseSync guarantees the native connection is established before
	// any query runs — openDatabaseAsync can return a JS wrapper before Android's
	// native SQLiteDatabase is ready, causing NullPointerException in prepareAsync.
	db = SQLite.openDatabaseSync("moodnote.db");

	await db.execAsync("PRAGMA journal_mode=WAL;");

	await db.execAsync(`
    CREATE TABLE IF NOT EXISTS entries (
      local_id        TEXT PRIMARY KEY NOT NULL,
      server_id       TEXT UNIQUE,
      title           TEXT,
      content         TEXT NOT NULL,
      entry_date      TEXT NOT NULL,
      input_method    TEXT NOT NULL DEFAULT 'TEXT',
      tags            TEXT NOT NULL DEFAULT '[]',
      word_count      INTEGER NOT NULL DEFAULT 0,
      is_private      INTEGER NOT NULL DEFAULT 0,
      analysis_status TEXT NOT NULL DEFAULT 'PENDING',
      sync_status     TEXT NOT NULL DEFAULT 'pending_create',
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_entries_sync_status
      ON entries(sync_status);

    CREATE INDEX IF NOT EXISTS idx_entries_entry_date
      ON entries(entry_date);

    CREATE INDEX IF NOT EXISTS idx_entries_server_id
      ON entries(server_id);
  `);

	// Migration: add content_fetched column if not yet present
	try {
		await db.execAsync(
			`ALTER TABLE entries ADD COLUMN content_fetched INTEGER NOT NULL DEFAULT 0;`,
		);
	} catch {
		// Column already exists — safe to ignore
	}

	// Migration: add emotion_analysis column if not yet present
	try {
		await db.execAsync(`ALTER TABLE entries ADD COLUMN emotion_analysis TEXT;`);
	} catch {
		// Column already exists — safe to ignore
	}

	// Migration: add retry_count column if not yet present (NFR-18: max 3 retries)
	try {
		await db.execAsync(
			`ALTER TABLE entries ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;`,
		);
	} catch {
		// Column already exists — safe to ignore
	}
}

export function getDb(): SQLite.SQLiteDatabase {
	if (!db) {
		throw new Error("Database not initialised — call initDatabase() first.");
	}
	return db;
}
