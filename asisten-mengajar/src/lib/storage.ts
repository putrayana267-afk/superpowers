const HISTORY_KEY = 'asisten_mengajar_history'
const MAX_ENTRIES = 50

export interface HistoryEntry {
  id: string
  toolId: string
  toolTitle: string
  inputs: Record<string, string>
  result: string
  createdAt: number
  isFavorite: boolean
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
  } catch {
    // Ignore storage quota errors
  }
}

export function saveEntry(
  entry: Omit<HistoryEntry, 'id' | 'createdAt' | 'isFavorite'>
): HistoryEntry {
  const entries = loadHistory()
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    isFavorite: false,
  }
  const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES)
  saveHistory(updated)
  return newEntry
}

export function getHistory(): HistoryEntry[] {
  return loadHistory()
}

export function getFavorites(): HistoryEntry[] {
  return loadHistory().filter((e) => e.isFavorite)
}

export function toggleFavorite(id: string): boolean {
  const entries = loadHistory()
  let newState = false
  const updated = entries.map((e) => {
    if (e.id === id) {
      newState = !e.isFavorite
      return { ...e, isFavorite: newState }
    }
    return e
  })
  saveHistory(updated)
  return newState
}

export function deleteEntry(id: string): void {
  const entries = loadHistory().filter((e) => e.id !== id)
  saveHistory(entries)
}

export function clearHistory(): void {
  saveHistory([])
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
