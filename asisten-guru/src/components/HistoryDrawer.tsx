import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Star, Trash2, Clock, Inbox } from 'lucide-react';
import type { HistoryEntry } from '../features/tools/types';
import { EmptyState } from './EmptyState';
import { cn } from '../lib/cn';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
  onOpenEntry: (entry: HistoryEntry) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

type Filter = 'all' | 'favorite';

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

export function HistoryDrawer({
  open,
  onClose,
  entries,
  onOpenEntry,
  onToggleFavorite,
  onDelete,
  onClearAll,
}: HistoryDrawerProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const visible =
    filter === 'favorite' ? entries.filter((e) => e.favorite) : entries;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/40 bg-emerald-soft/95 shadow-glass-lg backdrop-blur-xl"
            role="dialog"
            aria-label="Riwayat & Favorit"
          >
            <div className="flex items-center justify-between border-b border-white/40 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-emerald-deep">
                Riwayat & Favorit
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup riwayat"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/50 hover:bg-white/10 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-5 py-3">
              <FilterTab
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                Semua ({entries.length})
              </FilterTab>
              <FilterTab
                active={filter === 'favorite'}
                onClick={() => setFilter('favorite')}
              >
                Favorit ({entries.filter((e) => e.favorite).length})
              </FilterTab>
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="ml-auto text-xs font-medium text-red-500 hover:underline"
                >
                  Hapus semua
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {visible.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-7 w-7" />}
                  title={
                    filter === 'favorite'
                      ? 'Belum ada favorit'
                      : 'Riwayat masih kosong'
                  }
                  description={
                    filter === 'favorite'
                      ? 'Tandai hasil dengan bintang untuk menyimpannya di sini.'
                      : 'Setiap hasil yang Anda buat akan tersimpan otomatis di sini.'
                  }
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {visible.map((entry) => (
                    <li
                      key={entry.id}
                      className="glass overflow-hidden p-0"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenEntry(entry)}
                        className="block w-full px-4 py-3 text-left hover:bg-white/10"
                      >
                        <p className="font-display text-sm font-bold text-emerald-deep">
                          {entry.toolTitle}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-ink/60">
                          {entry.result.replace(/[#*`>_-]/g, '').slice(0, 120)}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-ink/40">
                          <Clock className="h-3 w-3" />
                          {formatDate(entry.createdAt)}
                        </p>
                      </button>
                      <div className="flex items-center justify-end gap-1 border-t border-white/40 bg-white/5 px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(entry.id)}
                          aria-label={
                            entry.favorite
                              ? 'Hapus dari favorit'
                              : 'Tambah ke favorit'
                          }
                          aria-pressed={entry.favorite}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                            entry.favorite
                              ? 'text-gold-deep hover:bg-gold/15'
                              : 'text-ink/40 hover:bg-white/10 hover:text-gold-deep',
                          )}
                        >
                          <Star
                            className="h-4 w-4"
                            fill={entry.favorite ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(entry.id)}
                          aria-label="Hapus dari riwayat"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/40 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'bg-brand text-[#04140C]'
          : 'bg-white/5 text-emerald-deep hover:bg-white/10',
      )}
    >
      {children}
    </button>
  );
}
