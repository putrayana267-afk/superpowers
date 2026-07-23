import { useState, type ReactNode } from 'react';
import { FileText, Star, Plus, ArrowRight } from '@phosphor-icons/react';
import type { HistoryEntry } from '../features/tools/types';
import { TOOLS, getToolById } from '../features/tools/registry';
import { matchToolByKeyword } from '../features/tools/routeKeywords';
import { useZonaWaktu } from '../features/waktu/useZonaWaktu';
import { GlassCard } from './GlassCard';
import { ActivityBars } from './ActivityBars';

interface BerandaProps {
  history: HistoryEntry[];
  onOpenEntry: (entry: HistoryEntry) => void;
  onStartCreate: () => void;
  onSelectTool: (id: string) => void;
}

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
    text: 'text-teal-text',
    chip: 'bg-teal/[0.18]',
    ring: 'border-teal/25',
    bar: 'bg-teal/70',
    wash: 'radial-gradient(180px at 0% 0%, rgba(52,231,224,.12), transparent 70%)',
  },
  gold: {
    text: 'text-gold-text',
    chip: 'bg-gold/[0.18]',
    ring: 'border-gold/25',
    bar: 'bg-gold/70',
    wash: 'radial-gradient(180px at 0% 0%, rgba(255,194,77,.12), transparent 70%)',
  },
  violet: {
    text: 'text-violet-text',
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

/** Label seksi — kapital kecil bertema, dipakai konsisten. */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-label">
      {children}
    </h2>
  );
}

/**
 * Hero sapaan — sapaan dari jam zona terpilih (`useZonaWaktu`, API sama seperti
 * hero). Tak ada sumber nama bersama → sapaan saja. Latar: dua blob aurora yang
 * hanyut halus (PC) + sheen sweep, di atas surface emerald-soft. Data IDENTIK:
 * subtext = "{count} dokumen tersimpan" bila ada, kalau kosong kalimat tenang.
 */
function Hero({
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
    <section className="brz-sheen relative overflow-hidden rounded-3xl border border-hairline/20 bg-emerald-soft p-7 sm:p-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="brz-aurora-a absolute -left-[12%] -top-[45%] h-[150%] w-[65%] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(76,232,150,.30), transparent 70%)',
          }}
        />
        <div
          className="brz-aurora-b absolute -right-[14%] -bottom-[55%] h-[160%] w-[70%] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(52,231,224,.22), transparent 72%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(76,232,150,.10), transparent 46%)',
          }}
        />
      </div>
      <div className="relative">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-primary/80">
          Ruang kerja
        </p>
        <h1 className="brz-neon font-display text-4xl font-bold leading-[1.03] text-emerald-deep sm:text-6xl">
          {sapaan}
        </h1>
        <p className="mt-3 max-w-md text-sm text-ink/70 sm:text-base">{subtext}</p>
        <button
          type="button"
          onClick={onStartCreate}
          className="brz-cta-glow mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-on-fill transition hover:bg-brand-hover active:bg-brand-active sm:mt-7"
        >
          <Plus className="h-4 w-4" weight="bold" />
          Buat dokumen
        </button>
      </div>
    </section>
  );
}

/**
 * Kotak "Ceritakan kebutuhanmu" — LAPIS 1 (cocok-kata client-only, TANPA AI).
 * Teks guru → matchToolByKeyword → buka tool via onSelectTool. Tak menyentuh
 * field kurikulum. Gagal cocok → hint lembut (fade opacity, hormati reduced-motion).
 */
function KotakKebutuhan({
  onSelectTool,
}: {
  onSelectTool: (id: string) => void;
}) {
  const [teks, setTeks] = useState('');
  const [tanpaHasil, setTanpaHasil] = useState(false);
  const [fokus, setFokus] = useState(false);

  const coba = () => {
    const id = matchToolByKeyword(teks);
    if (id && getToolById(id)) {
      onSelectTool(id);
      return;
    }
    setTanpaHasil(true);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-hairline/25 bg-emerald-soft/60 p-5 sm:p-6">
      <div
        aria-hidden
        className={
          'pointer-events-none absolute inset-0 transition-opacity duration-500 ' +
          'motion-reduce:transition-none ' +
          (fokus ? 'opacity-100' : 'opacity-45')
        }
        style={{
          background:
            'radial-gradient(280px 170px at 16% 0%, rgba(76,232,150,0.30), transparent 70%),' +
            'radial-gradient(240px 170px at 100% 100%, rgba(52,231,224,0.22), transparent 72%)',
        }}
      />
      <div className="relative">
        <SectionLabel>Ceritakan kebutuhanmu</SectionLabel>
        <textarea
          id="kotak-kebutuhan"
          aria-label="Ceritakan kebutuhanmu"
          rows={2}
          value={teks}
          onChange={(e) => {
            setTeks(e.target.value);
            if (tanpaHasil) setTanpaHasil(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              coba();
            }
          }}
          onFocus={() => setFokus(true)}
          onBlur={() => setFokus(false)}
          placeholder="mis. bikin soal ulangan, atau modul ajar…"
          className="w-full resize-none rounded-input border border-hairline/25 bg-surface-2 p-3 text-sm text-ink placeholder:text-ink/55 focus:border-emerald-primary/50 focus:outline-none focus:ring-1 focus:ring-emerald-primary/30"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={coba}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-input border border-emerald-primary/30 bg-emerald-primary/15 px-5 text-sm font-semibold text-emerald-deep transition hover:bg-emerald-primary/25 active:opacity-80"
          >
            Bantu pilih
            <ArrowRight className="h-4 w-4" weight="bold" />
          </button>
        </div>
        <p
          aria-live="polite"
          className={`mt-2 text-xs text-ink/70 transition-opacity duration-200 motion-reduce:transition-none ${
            tanpaHasil ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Belum ketemu yang pas — coba kata lebih spesifik, atau pilih dari Aksi
          cepat di bawah.
        </p>
      </div>
    </div>
  );
}

/**
 * Grid aksi cepat — SEMUA alat registry, urutan asli; klik → pilih alat. Reflow:
 * dari rail geser-horizontal menjadi GRID responsif (HP 2 kolom, ≥sm 3 kolom) →
 * NOL horizontal-scroll di HP. Diperkaya `description` & `category` (keduanya dari
 * registry TOOLS — bukan data baru).
 */
function AksiCepat({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  return (
    <div>
      <SectionLabel>Aksi cepat</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {TOOLS.map((tool) => {
          const accent = ACCENTS[tool.id] ?? ACCENT_DEFAULT;
          const Ikon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool(tool.id)}
              className={`group relative flex min-h-[44px] flex-col gap-3 overflow-hidden rounded-2xl border bg-surface-2 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-glass active:translate-y-0 sm:p-5 ${accent.ring}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                style={{ background: accent.wash }}
              />
              <span className="relative flex items-center justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.chip}`}
                >
                  <Ikon weight="duotone" className={`h-6 w-6 ${accent.text}`} />
                </span>
                <span className={`h-[2px] w-8 rounded-full ${accent.bar}`} />
              </span>
              <span className="relative flex flex-col gap-1">
                <span className="font-display text-sm font-bold leading-tight text-emerald-deep">
                  {tool.title}
                </span>
                <span
                  className="text-xs leading-snug text-ink/60"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {tool.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Statistik — total besar (neon, font-grotesk) + chip per jenis; angka tabular. */
function Statistik({
  count,
  breakdown,
}: {
  count: number;
  breakdown: { id: string; label: string; count: number }[];
}) {
  return (
    <div>
      <SectionLabel>Statistik</SectionLabel>
      <div className="brz-sheen relative overflow-hidden rounded-3xl border border-hairline/20 bg-emerald-soft p-6 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(320px 220px at 0% 0%, rgba(76,232,150,.14), transparent 72%)',
          }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="brz-neon font-grotesk text-6xl font-extrabold leading-none tabular-nums text-emerald-deep">
              {count}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wider text-label">
              Total dokumen
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {breakdown.map(({ id, label, count: n }) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline/25 bg-surface-2/70 px-3 py-1.5"
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
      <SectionLabel>Terbaru</SectionLabel>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recent.map((entry) => {
          const Ikon = getToolById(entry.toolId)?.icon ?? FileText;
          const preview = snippet(entry.result);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onOpenEntry(entry)}
              aria-label={`Buka ${entry.toolTitle}`}
              className="group block h-full w-full rounded-2xl text-left transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <GlassCard className="h-full transition-shadow duration-200 group-hover:shadow-glass-lg" animate={false}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-primary/[0.14] text-emerald-primary">
                    <Ikon className="h-5 w-5" weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-emerald-deep">
                        {entry.toolTitle}
                      </h3>
                      {entry.favorite && (
                        <Star className="h-4 w-4 flex-shrink-0 fill-gold-text text-gold-text" />
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

function CaraKerja() {
  const langkah = [
    { n: '1', judul: 'Pilih alat & isi kurikulum', teks: 'Tentukan jenjang, mapel, dan pokok bahasan dari Capaian Pembelajaran resmi.' },
    { n: '2', judul: 'AI menyusun dokumennya', teks: 'Modul Ajar, LKPD, soal, rubrik — sesuai struktur Kurikulum Merdeka.' },
    { n: '3', judul: 'Simpan, unduh, atau bagikan', teks: 'Dokumen tersimpan di sini agar mudah dibuka kembali.' },
  ];
  return (
    <div>
      <SectionLabel>Cara kerja</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {langkah.map(({ n, judul, teks }) => (
          <div
            key={n}
            className="flex items-start gap-3 rounded-2xl border border-hairline/25 bg-emerald-soft/60 p-4 sm:flex-col sm:gap-3"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-emerald-primary/40 font-grotesk text-sm font-bold text-emerald-primary">
              {n}
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-emerald-deep">{judul}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-ink/60">{teks}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Beranda — dashboard noir dari dokumen tersimpan (state `history` milik App).
 * Nol data baru: semua turunan dari prop + registry + jam zona. Sapaan tanpa
 * nama (tak ada sumber bersama), aktivitas nyata dari createdAt. Reskin "Akhid
 * Noir": aurora hanyut + sheen + neon (progressive enhancement — di HP &
 * prefers-reduced-motion loop ambient mati, entrance ringan). Kosong → hero +
 * kotak kebutuhan + aksi cepat + tanda kosong tipis + Cara kerja.
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
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="brz-rise-blur">
        <Hero count={count} onStartCreate={onStartCreate} />
      </div>
      <div className="brz-rise" style={{ animationDelay: '0.08s' }}>
        <KotakKebutuhan onSelectTool={onSelectTool} />
      </div>
      <div className="brz-rise" style={{ animationDelay: '0.16s' }}>
        <AksiCepat onSelectTool={onSelectTool} />
      </div>

      {count === 0 ? (
        <>
          <div
            className="brz-rise rounded-2xl border border-hairline/25 bg-emerald-soft/60 px-5 py-4 text-sm text-ink/60"
            style={{ animationDelay: '0.24s' }}
          >
            Belum ada dokumen — yang Anda buat akan muncul di sini agar mudah
            dibuka kembali.
          </div>
          <div className="brz-rise" style={{ animationDelay: '0.32s' }}>
            <CaraKerja />
          </div>
        </>
      ) : (
        <>
          <div className="brz-rise" style={{ animationDelay: '0.24s' }}>
            <Statistik count={count} breakdown={breakdown} />
          </div>
          <div className="brz-rise" style={{ animationDelay: '0.32s' }}>
            <ActivityBars history={history} />
          </div>
          <div className="brz-rise" style={{ animationDelay: '0.40s' }}>
            <Terbaru recent={recent} onOpenEntry={onOpenEntry} />
          </div>
        </>
      )}
    </div>
  );
}
