import {
  Users,
  ClipboardText,
  Medal,
  FileText,
  Star,
  Plus,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import type { HistoryEntry } from '../features/tools/types';
import { TOOLS, getToolById } from '../features/tools/registry';
import { useZonaWaktu } from '../features/waktu/useZonaWaktu';
import { GlassCard } from './GlassCard';
import { ActivityBars } from './ActivityBars';

interface BerandaProps {
  history: HistoryEntry[];
  onOpenEntry: (entry: HistoryEntry) => void;
  onStartCreate: () => void;
  onSelectTool: (id: string) => void;
}

interface DashTile {
  id: string;
  label: string;
  icon: Icon;
}

// Fitur data siswa yang belum dibangun — tetap "Segera hadir" (jujur), sekunder
// di bawah konten dokumen nyata. TANPA angka/data palsu.
const TILES: DashTile[] = [
  { id: 'siswa', label: 'Siswa', icon: Users },
  { id: 'absensi', label: 'Absensi', icon: ClipboardText },
  { id: 'nilai', label: 'Nilai', icon: Medal },
];

/**
 * Tint aksen per alat (LOKAL) — 4 hue token noir. Tiap hue punya: `text` (ikon
 * penuh), `chip` (bg ikon), `ring` (border berwarna lembut), `bar` (garis jejak),
 * `wash` (radial sudut atas-kiri, opacity SANGAT rendah — jaga noir). Pemetaan
 * hue tak berubah: emerald·teal·gold·violet berputar seperti sebelumnya.
 */
interface Accent {
  text: string;
  chip: string;
  ring: string;
  bar: string;
  wash: string;
}
const HUE: Record<'emerald' | 'teal' | 'gold' | 'violet', Accent> = {
  emerald: {
    text: 'text-emerald-primary',
    chip: 'bg-emerald-primary/[0.18]',
    ring: 'border-emerald-primary/25',
    bar: 'bg-emerald-primary/70',
    wash: 'radial-gradient(180px at 0% 0%, rgba(76,232,150,.12), transparent 70%)',
  },
  teal: {
    text: 'text-teal',
    chip: 'bg-teal/[0.18]',
    ring: 'border-teal/25',
    bar: 'bg-teal/70',
    wash: 'radial-gradient(180px at 0% 0%, rgba(52,231,224,.12), transparent 70%)',
  },
  gold: {
    text: 'text-gold',
    chip: 'bg-gold/[0.18]',
    ring: 'border-gold/25',
    bar: 'bg-gold/70',
    wash: 'radial-gradient(180px at 0% 0%, rgba(255,194,77,.12), transparent 70%)',
  },
  violet: {
    text: 'text-violet',
    chip: 'bg-violet/[0.18]',
    ring: 'border-violet/25',
    bar: 'bg-violet/70',
    wash: 'radial-gradient(180px at 0% 0%, rgba(155,140,255,.12), transparent 70%)',
  },
};
const ACCENT_DEFAULT: Accent = HUE.emerald;
const ACCENTS: Record<string, Accent> = {
  'modul-ajar': HUE.emerald,
  'bank-soal': HUE.teal,
  'kisi-kisi': HUE.gold,
  lkpd: HUE.violet,
  rubrik: HUE.emerald,
  sederhana: HUE.teal,
  rapor: HUE.gold,
  'ide-kegiatan': HUE.violet,
  'komunikasi-ortu': HUE.emerald,
};

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
  const flat = result
    .replace(/[#*`_~]/g, '') // buang penanda markdown umum (tanda hubung dibiarkan)
    .replace(/\s+/g, ' ') // rapikan spasi ganda
    .trim();
  return flat.length > 80 ? `${flat.slice(0, 80)}…` : flat;
}

/** Sapaan sesuai jam — pola identik PremiumHero (satu sumber logika, TANPA nama). */
function greetingByHour(h: number): string {
  if (h >= 4 && h < 11) return 'Selamat pagi';
  if (h >= 11 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/** Jam lokal pada zona terpilih (0–23) — dari satu Intl.DateTimeFormat. */
function jamPadaZona(timeZone: string | undefined): number {
  const nilai = new Intl.DateTimeFormat('id-ID', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  })
    .formatToParts(new Date())
    .find((p) => p.type === 'hour')?.value;
  return Number(nilai ?? '0');
}

/**
 * Banner sapaan — sapaan dari jam zona terpilih (`useZonaWaktu`, API sama seperti
 * hero). Tak ada sumber nama bersama → sapaan saja. Latar: 2 blob radial STATIS
 * di atas surface #04331D, tanpa backdrop-filter.
 */
function Banner({
  count,
  onStartCreate,
}: {
  count: number;
  onStartCreate: () => void;
}) {
  const { timeZone } = useZonaWaktu();
  const sapaan = greetingByHour(jamPadaZona(timeZone));
  const subtext =
    count > 0
      ? `${count} dokumen tersimpan`
      : 'Semua bahan ajarmu dalam satu ruang kerja yang tenang.';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-emerald-soft p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(76,232,150,.12), transparent 45%), radial-gradient(420px 300px at 12% 15%, rgba(76,232,150,.25), transparent 70%), radial-gradient(380px 300px at 90% 95%, rgba(52,231,224,.18), transparent 72%)',
        }}
      />
      <div className="relative">
        <h1 className="font-display text-4xl font-bold leading-[1.05] text-emerald-deep sm:text-5xl">
          {sapaan}
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink/65">{subtext}</p>
        <button
          type="button"
          onClick={onStartCreate}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-[#04140C] transition hover:bg-brand-hover active:bg-brand-active"
        >
          <Plus className="h-4 w-4" />
          Buat dokumen
        </button>
      </div>
    </section>
  );
}

/** Rail aksi cepat — SEMUA alat registry, urutan asli; klik → pilih alat. */
function AksiCepat({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  return (
    <div>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
        Aksi cepat
      </h2>
      <div className="flex snap-x gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TOOLS.map((tool) => {
          const accent = ACCENTS[tool.id] ?? ACCENT_DEFAULT;
          const Ikon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool(tool.id)}
              className={`relative min-w-[150px] snap-start overflow-hidden rounded-2xl border bg-[#06180F] p-5 text-left transition-opacity hover:opacity-90 active:opacity-80 ${accent.ring}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: accent.wash }}
              />
              <span className="relative flex flex-col gap-3">
                <span className={`h-[2px] w-8 rounded-full ${accent.bar}`} />
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.chip}`}
                >
                  <Ikon className={`h-5 w-5 ${accent.text}`} />
                </span>
                <span className="font-display text-sm font-bold text-emerald-deep">
                  {tool.title}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Statistik — total besar + chip per jenis; semua ANGKA font-grotesk. */
function Statistik({
  count,
  breakdown,
}: {
  count: number;
  breakdown: { id: string; label: string; count: number }[];
}) {
  return (
    <div>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
        Statistik
      </h2>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <p className="font-grotesk text-4xl font-extrabold tabular-nums leading-none text-emerald-deep">
            {count}
          </p>
          <p className="mt-1 text-xs text-ink/60">Total dokumen</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {breakdown.map(({ id, label, count: n }) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-emerald-soft/60 px-3 py-1.5"
            >
              <span className="font-grotesk text-sm font-bold tabular-nums text-emerald-deep">
                {n}
              </span>
              <span className="text-xs text-ink/60">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Terbaru — 6 dokumen, diperkaya ikon jenis (registry) + tanggal + cuplikan. */
function Terbaru({
  recent,
  onOpenEntry,
}: {
  recent: HistoryEntry[];
  onOpenEntry: (entry: HistoryEntry) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
        Terbaru
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recent.map((entry) => {
          const Ikon = getToolById(entry.toolId)?.icon ?? FileText;
          const preview = snippet(entry.result);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onOpenEntry(entry)}
              aria-label={`Buka ${entry.toolTitle}`}
              className="block h-full w-full rounded-2xl text-left transition-opacity hover:opacity-90 active:opacity-80"
            >
              <GlassCard className="h-full" animate={false}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep">
                    <Ikon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-emerald-deep">
                        {entry.toolTitle}
                      </h3>
                      {entry.favorite && (
                        <Star className="h-4 w-4 flex-shrink-0 fill-gold text-gold" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink/50">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </div>
                {preview && (
                  <p className="mt-2 text-sm text-ink/70">{preview}</p>
                )}
              </GlassCard>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Segera hadir — satu baris kompak 3 tile kecil; badge emas dipertahankan. */
function SegeraHadir() {
  return (
    <div>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
        Segera hadir
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        {TILES.map(({ id, label, icon: Ikon }) => (
          <div
            key={id}
            className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-emerald-soft/60 px-4 py-3"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep">
              <Ikon className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-bold text-emerald-deep">
              {label}
            </span>
            <span className="ml-auto inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
              Segera hadir
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Beranda — dashboard noir dari dokumen tersimpan (state `history` milik App).
 * Nol data baru: semua turunan dari prop + registry + jam zona. Sapaan tanpa
 * nama (tak ada sumber bersama), aktivitas nyata dari createdAt, tanpa animasi
 * berjalan-terus. Kosong → banner + aksi cepat + tanda kosong tipis + Segera hadir.
 */
export function Beranda({
  history,
  onOpenEntry,
  onStartCreate,
  onSelectTool,
}: BerandaProps) {
  const count = history.length;
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
    <div className="flex flex-col gap-8">
      <Banner count={count} onStartCreate={onStartCreate} />
      <AksiCepat onSelectTool={onSelectTool} />

      {count === 0 ? (
        <>
          <div className="rounded-2xl border border-white/10 bg-emerald-soft/60 px-5 py-4 text-sm text-ink/60">
            Belum ada dokumen — yang Anda buat akan muncul di sini agar mudah
            dibuka kembali.
          </div>
          <SegeraHadir />
        </>
      ) : (
        <>
          <Statistik count={count} breakdown={breakdown} />
          <ActivityBars history={history} />
          <Terbaru recent={recent} onOpenEntry={onOpenEntry} />
          <SegeraHadir />
        </>
      )}
    </div>
  );
}
