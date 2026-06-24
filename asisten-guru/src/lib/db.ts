/**
 * Lapisan penyimpanan SQLite lokal/offline (Capacitor Community SQLite).
 *
 * PENTING (web): SQLite native HANYA dijalankan di platform native
 * (Capacitor.isNativePlatform()). Di web semua operasi adalah no-op yang aman
 * (mengembalikan default kosong) sehingga TIDAK pernah memblokir/menggantung
 * render — versi web tetap memakai serverless + Riwayat localStorage lama.
 *
 * Dipakai untuk menyimpan SEMUA hasil generate dan setelan (mis. API key BYOK)
 * di aplikasi Android. TIDAK memakai localStorage untuk data inti native.
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'asisten_guru';
const DB_VERSION = 1;

/** SQLite asli hanya tersedia di platform native. */
const NATIVE = Capacitor.isNativePlatform();

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;
let initPromise: Promise<void> | null = null;

/** Satu baris hasil generate yang tersimpan. */
export interface GenerationRow {
  id: number;
  tool: string;
  title: string;
  subject: string;
  grade: string;
  input_json: string;
  output_text: string;
  created_at: number;
}

/** Buat tabel sekali; pakai PRAGMA user_version untuk migrasi ke depan. */
async function migrate(conn: SQLiteDBConnection): Promise<void> {
  const res = await conn.query('PRAGMA user_version;');
  const current = Number(
    (res.values?.[0] as { user_version?: number } | undefined)?.user_version ?? 0,
  );

  if (current < 1) {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS generations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tool TEXT NOT NULL,
        title TEXT NOT NULL,
        subject TEXT,
        grade TEXT,
        input_json TEXT,
        output_text TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_generations_tool ON generations(tool);
      CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at);
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }

  await conn.execute(`PRAGMA user_version = ${DB_VERSION};`);
}

/**
 * Inisialisasi koneksi DB (idempoten). Di web langsung resolve (no-op).
 * Semua error ditangkap pemanggil; tidak boleh memblokir render.
 */
export function initDb(): Promise<void> {
  if (!NATIVE) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
    db = isConn
      ? await sqlite.retrieveConnection(DB_NAME, false)
      : await sqlite.createConnection(
          DB_NAME,
          false,
          'no-encryption',
          DB_VERSION,
          false,
        );

    await db.open();
    await migrate(db);
  })();
  return initPromise;
}

async function getDb(): Promise<SQLiteDBConnection> {
  if (!db) await initDb();
  if (!db) throw new Error('Database belum siap.');
  return db;
}

export interface SaveGenerationInput {
  tool: string;
  title: string;
  subject?: string;
  grade?: string;
  inputJson: string;
  outputText: string;
  createdAt?: number;
}

/** Simpan satu hasil generate. Mengembalikan id baris (0 di web). */
export async function saveGeneration(
  input: SaveGenerationInput,
): Promise<number> {
  if (!NATIVE) return 0;
  const conn = await getDb();
  const createdAt = input.createdAt ?? Date.now();
  const res = await conn.run(
    `INSERT INTO generations
       (tool, title, subject, grade, input_json, output_text, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      input.tool,
      input.title,
      input.subject ?? '',
      input.grade ?? '',
      input.inputJson,
      input.outputText,
      createdAt,
    ],
  );
  return res.changes?.lastId ?? 0;
}

/** Daftar hasil tersimpan, terbaru dulu. Opsional difilter per alat. */
export async function listGenerations(tool?: string): Promise<GenerationRow[]> {
  if (!NATIVE) return [];
  const conn = await getDb();
  const res = tool
    ? await conn.query(
        `SELECT * FROM generations WHERE tool = ? ORDER BY created_at DESC;`,
        [tool],
      )
    : await conn.query(`SELECT * FROM generations ORDER BY created_at DESC;`);
  return (res.values ?? []) as GenerationRow[];
}

/** Ambil satu hasil berdasarkan id. */
export async function getGeneration(id: number): Promise<GenerationRow | null> {
  if (!NATIVE) return null;
  const conn = await getDb();
  const res = await conn.query(`SELECT * FROM generations WHERE id = ?;`, [id]);
  const rows = (res.values ?? []) as GenerationRow[];
  return rows[0] ?? null;
}

/** Hapus satu hasil. */
export async function deleteGeneration(id: number): Promise<void> {
  if (!NATIVE) return;
  const conn = await getDb();
  await conn.run(`DELETE FROM generations WHERE id = ?;`, [id]);
}

/** Ambil nilai setelan (mis. 'gemini_api_key'). null di web. */
export async function getSetting(key: string): Promise<string | null> {
  if (!NATIVE) return null;
  const conn = await getDb();
  const res = await conn.query(`SELECT value FROM settings WHERE key = ?;`, [key]);
  const rows = (res.values ?? []) as Array<{ value: string }>;
  return rows[0]?.value ?? null;
}

/** Simpan/ubah nilai setelan. No-op di web. */
export async function setSetting(key: string, value: string): Promise<void> {
  if (!NATIVE) return;
  const conn = await getDb();
  await conn.run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [key, value],
  );
}

/** True bila penyimpanan SQLite aktif (native). Untuk UI kondisional. */
export function isStorageAvailable(): boolean {
  return NATIVE;
}
