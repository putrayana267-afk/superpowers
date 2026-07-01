import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Award,
  FileText,
  Star,
  Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HistoryEntry } from '../features/tools/types';
import { GlassCard } from './GlassCard';

interface BerandaProps {
  history: HistoryEntry[];
  onOpenEntry: (entry: HistoryEntry) => void;
  onStartCreate: () => void;
}

interface DashTile {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Fitur data siswa yang belum dibangun — tetap "Segera hadir" (jujur), sekunder
// di bawah konten dokumen nyata. TANPA angka/data palsu.
const TILES: DashTile[] = [
  { id: 'siswa', label: 'Siswa', icon: Users },
  { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
  { id: 'nilai', label: 'Nilai', icon: Award },
];

/** Tanggal ringkas Indonesia — duplikat lokal; TIDAK menyentuh HistoryDrawer/Tersimpan. */
function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ts));
}

/** Cuplikan hasil pendek (≤ ~80 char). Tidak pernah merender `inputs` mentah. */
function snippet(result: string): string {
  const flat = result.replace(/\s+/g, ' ').trim();
  return flat.length > 80 ? `${flat.slice(0, 80)}…` : flat;
}

function BerandaHeader() {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
          <LayoutDashboard className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-extrabold text-emerald-deep sm:text-2xl">
            Beranda
          </h1>
          <p className="text-sm text-ink/60">
            Ringkasan dokumen yang sudah Anda buat.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Tile fitur mendatang — sekunder, di bawah konten nyata. */
function ComingSoonTiles() {
  return (
    <div>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
        Segera hadir
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TILES.map(({ id, label, icon: Icon }) => (
          <GlassCard
            key={id}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-soft text-emerald-deep gold-edge">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-emerald-deep">
              {label}
            </h3>
            <span className="mt-2 inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
              Segera hadir
            </span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/**
 * Beranda — dashboard dari dokumen tersimpan (state `history` milik App).
 * Nol data baru: semua dari prop. Reuse GlassCard + token noir yang ada.
 */
export function Beranda({ history, onOpenEntry, onStartCreate }: BerandaProps) {
  const count = history.length;
  const countLabel = count >= 50 ? '50+' : String(count);
  const recent = history.slice(0, 6);

  // Rincian jumlah per jenis dokumen — murni turunan dari `history` (tak ada data
  // baru). Kelompokkan per toolId, label = toolTitle, urut jumlah menurun.
  const byType = new Map<string, { id: string; label: string; count: number }>();
  for (const entry of history) {
    const cur = byType.get(entry.toolId);
    if (cur) cur.count += 1;
    else
      byType.set(entry.toolId, {
        id: entry.toolId,
        label: entry.toolTitle,
        count: 1,
      });
  }
  const breakdown = [...byType.values()].sort((a, b) => b.count - a.count);

  return (
    <>
      <BerandaHeader />

      {count === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-soft text-emerald-deep gold-edge">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-emerald-deep">
            Belum ada dokumen
          </h2>
          <p className="mt-1 max-w-sm text-sm text-ink/60">
            Dokumen yang Anda buat akan muncul di sini agar mudah dibuka kembali.
          </p>
          <button
            type="button"
            onClick={onStartCreate}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-[#04140C] transition hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Buat dokumen pertama
          </button>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Ringkas: jumlah dokumen nyata */}
          <GlassCard className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-soft text-emerald-deep gold-edge">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-emerald-deep">
                {countLabel}
              </p>
              <p className="text-sm text-ink/60">Dokumen tersimpan</p>
            </div>
          </GlassCard>

          {/* Rincian jumlah per jenis dokumen */}
          <div>
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
              Per jenis
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {breakdown.map(({ id, label, count: n }) => (
                <GlassCard key={id} className="flex flex-col py-4">
                  <p className="font-display text-2xl font-extrabold text-emerald-deep">
                    {n}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/60">{label}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Terbaru: kartu yang bisa diklik untuk buka ulang */}
          <div>
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
              Terbaru
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((entry) => {
                const preview = snippet(entry.result);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpenEntry(entry)}
                    aria-label={`Buka ${entry.toolTitle}`}
                    className="block h-full w-full rounded-2xl text-left transition"
                  >
                    <GlassCard className="h-full transition hover:border-[rgba(142,255,202,0.28)]">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-emerald-deep">
                          {entry.toolTitle}
                        </h3>
                        {entry.favorite && (
                          <Star className="h-4 w-4 flex-shrink-0 fill-gold text-gold" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink/50">
                        {formatDate(entry.createdAt)}
                      </p>
                      {preview && (
                        <p className="mt-2 text-sm text-ink/70">{preview}</p>
                      )}
                    </GlassCard>
                  </button>
                );
              })}
            </div>
          </div>

          <ComingSoonTiles />
        </div>
      )}
    </>
  );
}
