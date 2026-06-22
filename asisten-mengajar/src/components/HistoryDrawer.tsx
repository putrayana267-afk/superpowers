import { useState, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X, Star, Trash2, Clock, RotateCcw } from 'lucide-react'
import {
  getHistory,
  getFavorites,
  deleteEntry,
  toggleFavorite,
  formatDate,
  type HistoryEntry,
} from '../lib/storage'
import { TOOLS } from '../features/tools/registry'
import { cn } from '../lib/cn'

interface HistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  onRestore: (entry: HistoryEntry) => void
}

type Tab = 'history' | 'favorites'

function EntryCard({
  entry,
  onRestore,
  onDelete,
  onToggleFavorite,
}: {
  entry: HistoryEntry
  onRestore: (e: HistoryEntry) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  const tool = TOOLS.find((t) => t.id === entry.toolId)
  const Icon = tool?.Icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="glass rounded-xl p-3 space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{entry.toolTitle}</p>
            <p className="text-xs text-emerald-400/50">{formatDate(entry.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleFavorite(entry.id)}
            aria-label={entry.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            className="w-7 h-7 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Star className={`w-3.5 h-3.5 ${entry.isFavorite ? 'text-gold fill-gold' : 'text-white/30'}`} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            aria-label="Hapus entri ini"
            className="w-7 h-7 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center text-white/30 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-emerald-300/50 line-clamp-2">
        {entry.result.slice(0, 120)}…
      </p>
      <button
        onClick={() => onRestore(entry)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <RotateCcw className="w-3 h-3" />
        Buka Lagi
      </button>
    </motion.div>
  )
}

export function HistoryDrawer({ isOpen, onClose, onRestore }: HistoryDrawerProps) {
  const prefersReducedMotion = useReducedMotion()
  const slideX = prefersReducedMotion ? 0 : '100%'

  const [tab, setTab] = useState<Tab>('history')
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (isOpen) {
      setEntries(tab === 'history' ? getHistory() : getFavorites())
    }
  }, [isOpen, tab])

  const handleDelete = (id: string) => {
    deleteEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id)
    if (tab === 'favorites') {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } else {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
      )
    }
  }

  const handleRestore = (entry: HistoryEntry) => {
    onRestore(entry)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed inset-y-0 right-0 w-80 max-w-full z-50 flex flex-col"
            initial={{ x: slideX }}
            animate={{ x: 0 }}
            exit={{ x: slideX }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            aria-label="Riwayat dan Favorit"
          >
            <div className="glass h-full flex flex-col border-l border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h2 className="font-display font-bold text-white">Riwayat</h2>
                <button
                  onClick={onClose}
                  aria-label="Tutup panel riwayat"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {(['history', 'favorites'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                      tab === t
                        ? 'text-emerald-300 border-b-2 border-emerald-400 -mb-px'
                        : 'text-white/40 hover:text-white/70'
                    )}
                    aria-selected={tab === t}
                    role="tab"
                  >
                    {t === 'history' ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Riwayat
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5" />
                        Favorit
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {entries.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 gap-3 text-center"
                    >
                      {tab === 'history' ? (
                        <Clock className="w-8 h-8 text-emerald-400/30" />
                      ) : (
                        <Star className="w-8 h-8 text-gold/30" />
                      )}
                      <p className="text-sm text-emerald-300/40">
                        {tab === 'history'
                          ? 'Belum ada riwayat. Mulai gunakan alat untuk menyimpan hasil.'
                          : 'Belum ada favorit. Tandai ★ pada hasil yang ingin disimpan.'}
                      </p>
                    </motion.div>
                  ) : (
                    entries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        onRestore={handleRestore}
                        onDelete={handleDelete}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
