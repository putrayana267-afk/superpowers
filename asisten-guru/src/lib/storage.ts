import type { HistoryEntry } from '../features/tools/types';

const HISTORY_KEY = 'asisten-guru:history:v1';
const MAX_HISTORY = 50;

/** Baca seluruh riwayat dari localStorage (aman jika kosong/rusak). */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.toolId === 'string' &&
    typeof v.result === 'string' &&
    typeof v.createdAt === 'number'
  );
}

/** Simpan seluruh riwayat ke localStorage. */
export function saveHistory(entries: HistoryEntry[]): void {
  try {
    const trimmed = entries.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Abaikan kegagalan kuota — tidak boleh membuat aplikasi crash.
  }
}

/** Buat id unik sederhana untuk entri riwayat. */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
