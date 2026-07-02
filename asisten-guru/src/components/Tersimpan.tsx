import { useCallback, useEffect, useState } from 'react';
import { Archive, Copy, Trash2, FolderOpen, Clock, Loader2 } from 'lucide-react';
import { Archive as ArchiveDuotone } from '@phosphor-icons/react';
import { GlassCard } from './GlassCard';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { useToast } from './Toast';
import { cn } from '../lib/cn';
import { copyToClipboard } from '../lib/clipboard';
import { listGenerations, deleteGeneration } from '../lib/db';
import type { GenerationRow } from '../lib/db';
import { TOOLS, getToolById } from '../features/tools/registry';

interface TersimpanProps {
  /** Buka hasil tersimpan kembali di area kerja. */
  onOpen: (row: GenerationRow) => void;
}

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

function toolTitle(toolId: string): string {
  return getToolById(toolId)?.title ?? toolId;
}

export function Tersimpan({ onOpen }: TersimpanProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<GenerationRow[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listGenerations(filter === 'all' ? undefined : filter);
      setItems(rows);
    } catch (e) {
      console.error('Gagal memuat data tersimpan:', e);
      toast('Gagal memuat data tersimpan.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCopy = useCallback(
    async (text: string) => {
      const ok = await copyToClipboard(text);
      toast(ok ? 'Hasil tersalin.' : 'Gagal menyalin.', ok ? 'success' : 'error');
    },
    [toast],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteGeneration(id);
        setItems((prev) => prev.filter((r) => r.id !== id));
        toast('Hasil dihapus.', 'success');
      } catch {
        toast('Gagal menghapus. Coba lagi.', 'error');
      }
    },
    [toast],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Filter per alat */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Semua"
        />
        {TOOLS.map((t) => (
          <FilterChip
            key={t.id}
            active={filter === t.id}
            onClick={() => setFilter(t.id)}
            label={t.title}
          />
        ))}
      </div>

      {loading ? (
        <GlassCard animate>
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat…
          </div>
        </GlassCard>
      ) : items.length === 0 ? (
        <GlassCard animate>
          <EmptyState
            icon={<Archive className="h-7 w-7" />}
            title="Belum ada yang tersimpan"
            description="Setiap hasil yang Anda buat otomatis tersimpan di perangkat dan muncul di sini — bisa dibuka kembali walau offline."
          />
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((row) => (
            <GlassCard key={row.id} animate className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-deep/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-deep">
                      {toolTitle(row.tool)}
                    </span>
                    {row.subject && (
                      <span className="text-xs text-ink/60">{row.subject}</span>
                    )}
                    {row.grade && (
                      <span className="text-xs text-ink/40">· {row.grade}</span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink/70">
                    {row.output_text.replace(/[#*`>_-]/g, '').slice(0, 160)}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-ink/40">
                    <Clock className="h-3 w-3" />
                    {formatDate(row.created_at)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpen(row)}
                  icon={<FolderOpen className="h-4 w-4" />}
                >
                  Buka
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(row.output_text)}
                  icon={<Copy className="h-4 w-4" />}
                >
                  Salin
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => handleDelete(row.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Hapus
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
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
      {label}
    </button>
  );
}

export { ArchiveDuotone as TersimpanIcon };
