import { useState, type ReactNode, type CSSProperties } from 'react';
import {
  FileText,
  Star,
  Plus,
  ArrowRight,
  ArrowUpRight,
  FilePlus,
} from '@phosphor-icons/react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
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
 * Tint aksen per alat (LOKAL) — 4 hue token noir, kini lebih BERANI. Tiap hue
 * cukup menyimpan kanal `rgb` + kelas warna ikon + kelas border; gradient tile,
 * glow, dan wash diturunkan dari `rgb` (DRY). Pemetaan hue tak berubah:
 * emerald·teal·gold·violet berputar seperti sebelumnya.
 */
interface Accent {
  rgb: string;
  icon: string;
  ring: string;
}
const HUE: Record<'emerald' | 'teal' | 'gold' | 'violet', Accent> = {
  emerald: { rgb: '76,232,150', icon: 'text-emerald-primary', ring: 'border-emerald-primary/30' },
  teal: { rgb: '52,231,224', icon: 'text-teal-text', ring: 'border-teal/30' },
  gold: { rgb: '255,194,77', icon: 'text-gold-text', ring: 'border-gold/30' },
  violet: { rgb: '155,140,255', icon: 'text-violet-text', ring: 'border-violet/30' },
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
/** Gaya tile ikon berbobot: gradien aksen + inner-highlight + glow. */
function tileStyle(rgb: string): CSSProperties {
  return {
    background: `linear-gradient(145deg, rgba(${rgb},0.34), rgba(${rgb},0.07))`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), 0 0 26px -6px rgba(${rgb},0.6)`,
  };
}
/** Wash sudut kartu — kini lebih terlihat (opacity naik, tetap noir). */
function washStyle(rgb: string): CSSProperties {
  return {
    background: `radial-gradient(260px 210px at 22% 0%, rgba(${rgb},0.20), transparent 72%)`,
  };
}

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
    <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-emerald-deep/80">
      {children}
    </h2>
  );
}

/**
 * Hero sapaan — sapaan dari jam zona terpilih (`useZonaWaktu`, API sama seperti
 * hero). Tak ada sumber nama bersama → sapaan saja. Latar: orb emerald denyut +
 * aurora teal hanyut + grain + sheen (semua PC; adem di HP/reduced-motion), di
 * atas surface elevasi. Data IDENTIK: subtext = "{count} dokumen tersimpan" bila
 * ada, kalau kosong kalimat tenang.
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
    <section className="brz-grain brz-sheen brz-depth relative overflow-hidden rounded-3xl border border-emerald-primary/15 bg-emerald-soft p-5 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="brz-orb absolute -top-[35%] right-[2%] h-[135%] w-[50%] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(76,232,150,0.50), transparent 68%)',
          }}
        />
        <div
          className="brz-aurora-b absolute -bottom-[55%] -left-[14%] h-[160%] w-[68%] rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(52,231,224,0.30), transparent 72%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(76,232,150,0.14), transparent 46%)',
          }}
        />
      </div>
      <div className="relative max-w-xl">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-primary">
          Ruang kerja
        </p>
        <h1 className="brz-neon font-display text-3xl font-bold leading-[1.04] text-emerald-deep sm:text-5xl lg:text-6xl">
          {sapaan}
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink/85 sm:text-base">{subtext}</p>
        <button
          type="button"
          onClick={onStartCreate}
          className="brz-cta-glow mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-on-fill shadow-lg transition hover:bg-brand-hover active:bg-brand-active sm:mt-6"
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
    <div className="brz-depth relative overflow-hidden rounded-3xl border border-hairline/25 bg-emerald-soft/70 p-5 sm:p-6">
      <div
        aria-hidden
        className={
          'pointer-events-none absolute inset-0 transition-opacity duration-500 ' +
          'motion-reduce:transition-none ' +
          (fokus ? 'opacity-100' : 'opacity-55')
        }
        style={{
          background:
            'radial-gradient(300px 190px at 14% 0%, rgba(76,232,150,0.34), transparent 70%),' +
            'radial-gradient(260px 190px at 100% 100%, rgba(52,231,224,0.26), transparent 72%)',
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
          className="w-full resize-none rounded-input border border-hairline/25 bg-surface-2 p-3 text-sm text-ink placeholder:text-ink/60 focus:border-emerald-primary/50 focus:outline-none focus:ring-1 focus:ring-emerald-primary/30"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={coba}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-input border border-emerald-primary/40 bg-emerald-primary/20 px-5 text-sm font-semibold text-emerald-deep transition hover:bg-emerald-primary/30 active:opacity-80"
          >
            Bantu pilih
            <ArrowRight className="h-4 w-4" weight="bold" />
          </button>
        </div>
        <p
          aria-live="polite"
          className={`mt-2 text-xs text-ink/75 transition-opacity duration-200 motion-reduce:transition-none ${
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

/** Kartu alat — ikon berbobot (fill) di tile bergradien+glow, judul, deskripsi.
 *  Elevasi nyata + hover lift; affordance panah kanan-atas (ganti "bar" lama). */
function KartuAlat({
  tool,
  onSelectTool,
}: {
  tool: (typeof TOOLS)[number];
  onSelectTool: (id: string) => void;
}) {
  const accent = ACCENTS[tool.id] ?? ACCENT_DEFAULT;
  const Ikon = tool.icon;
  return (
    <button
      type="button"
      onClick={() => onSelectTool(tool.id)}
      className={`brz-depth brz-depth-hover group relative flex min-h-[44px] flex-col gap-3.5 overflow-hidden rounded-2xl border bg-surface-2 p-4 text-left hover:-translate-y-1 sm:p-5 ${accent.ring}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-200 group-hover:opacity-100"
        style={washStyle(accent.rgb)}
      />
      <span className="relative flex items-start justify-between">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={tileStyle(accent.rgb)}
        >
          <Ikon weight="fill" className={`h-7 w-7 ${accent.icon}`} />
        </span>
        <ArrowUpRight
          weight="bold"
          className="h-4 w-4 flex-shrink-0 text-ink/30 transition group-hover:text-emerald-primary"
        />
      </span>
      <span className="relative flex flex-col gap-1">
        <span className="font-display text-sm font-bold leading-tight text-emerald-deep">
          {tool.title}
        </span>
        <span
          className="text-xs leading-snug text-ink/75"
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
}

/**
 * Grid aksi cepat — SEMUA alat registry, urutan asli; klik → pilih alat. Grid
 * responsif (HP 2 kolom, ≥sm 3 kolom) → NOL horizontal-scroll di HP. Deskripsi
 * & pemetaan aksen dari registry TOOLS (bukan data baru).
 */
function AksiCepat({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  return (
    <div>
      <SectionLabel>Aksi cepat</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {TOOLS.map((tool) => (
          <KartuAlat key={tool.id} tool={tool} onSelectTool={onSelectTool} />
        ))}
      </div>
    </div>
  );
}

/** Statistik — total besar (neon, font-grotesk) + chip per jenis dgn titik aksen. */
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
      <div className="brz-grain brz-sheen brz-depth relative overflow-hidden rounded-3xl border border-emerald-primary/15 bg-emerald-soft p-6 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(360px 240px at 0% 0%, rgba(76,232,150,0.18), transparent 72%)',
          }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="brz-neon font-grotesk text-6xl font-extrabold leading-none tabular-nums text-emerald-deep">
              {count}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wider text-emerald-deep/80">
              Total dokumen
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {breakdown.map(({ id, label, count: n }) => {
              const accent = ACCENTS[id] ?? ACCENT_DEFAULT;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline/25 bg-surface-2/80 px-3 py-1.5"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      background: `rgb(${accent.rgb})`,
                      boxShadow: `0 0 8px rgba(${accent.rgb},0.7)`,
                    }}
                  />
                  <span className="font-grotesk text-sm font-bold tabular-nums text-emerald-deep">
                    {n}
                  </span>
                  <span className="text-xs text-ink/75">{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Terbaru — 6 dokumen, ikon jenis (registry) berwarna aksen + tanggal + cuplikan. */
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
          const accent = ACCENTS[entry.toolId] ?? ACCENT_DEFAULT;
          const preview = snippet(entry.result);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onOpenEntry(entry)}
              aria-label={`Buka ${entry.toolTitle}`}
              className="group block h-full w-full rounded-2xl text-left"
            >
              <GlassCard
                className="brz-depth brz-depth-hover h-full group-hover:-translate-y-1"
                animate={false}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                    style={tileStyle(accent.rgb)}
                  >
                    <Ikon weight="fill" className={`h-5 w-5 ${accent.icon}`} />
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
                    <p className="mt-0.5 text-xs text-ink/65">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </div>
                {preview && (
                  <p className="mt-2 text-sm text-ink/80">{preview}</p>
                )}
              </GlassCard>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Ruang kosong (empty-state) — MENGUNDANG, bukan kotak teks gersang. Ilustrasi
 * cincin + FilePlus berpendar, kalimat jujur (tak ada data palsu), CTA kuat, lalu
 * baris "ghost card" (placeholder bergaris putus, jelas-jelas kosong) yang
 * memberi bayangan hasil nyata. Nol data fiktif.
 */
function RuangKosong({ onStartCreate }: { onStartCreate: () => void }) {
  const ghost = TOOLS.slice(0, 3);
  return (
    <div className="brz-grain brz-dotgrid brz-depth relative overflow-hidden rounded-3xl border border-emerald-primary/15 bg-emerald-soft p-8 text-center sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(420px 300px at 50% -10%, rgba(76,232,150,0.22), transparent 70%)',
        }}
      />
      <div className="relative flex flex-col items-center">
        <span className="relative mb-5 flex h-20 w-20 items-center justify-center">
          <span
            aria-hidden
            className="brz-orb absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(closest-side, rgba(76,232,150,0.35), transparent 70%)',
            }}
          />
          <span
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
            style={tileStyle('76,232,150')}
          >
            <FilePlus weight="fill" className="h-8 w-8 text-emerald-primary" />
          </span>
        </span>
        <h2 className="font-display text-2xl font-bold text-emerald-deep sm:text-3xl">
          Mulai dokumen pertamamu
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink/80">
          Belum ada dokumen — yang Anda buat akan muncul di sini agar mudah
          dibuka kembali.
        </p>
        <button
          type="button"
          onClick={onStartCreate}
          className="brz-cta-glow mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-on-fill transition hover:bg-brand-hover active:bg-brand-active"
        >
          <Plus className="h-4 w-4" weight="bold" />
          Buat dokumen pertama
        </button>
        <div className="mt-8 grid w-full grid-cols-3 gap-3 sm:gap-4">
          {ghost.map((tool) => {
            const accent = ACCENTS[tool.id] ?? ACCENT_DEFAULT;
            const Ikon = tool.icon;
            return (
              <div
                key={tool.id}
                aria-hidden
                className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-hairline/30 bg-surface-2/40 p-3 opacity-70 sm:p-4"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={tileStyle(accent.rgb)}
                >
                  <Ikon weight="fill" className={`h-4 w-4 ${accent.icon}`} />
                </span>
                <span className="h-1.5 w-10 rounded-full bg-ink/15" />
                <span className="h-1.5 w-7 rounded-full bg-ink/10" />
              </div>
            );
          })}
        </div>
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
            className="brz-depth flex items-start gap-3 rounded-2xl border border-hairline/25 bg-emerald-soft/70 p-4 sm:flex-col sm:gap-3"
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-emerald-primary/50 font-grotesk text-sm font-bold text-emerald-primary"
              style={{ boxShadow: '0 0 16px -4px rgba(76,232,150,0.6)' }}
            >
              {n}
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-emerald-deep">{judul}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-ink/75">{teks}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Varian reveal bertahap (framer-motion). Reduced-motion → tanpa animasi.
const listV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

/**
 * Beranda — dashboard noir dari dokumen tersimpan (state `history` milik App).
 * Nol data baru: semua turunan dari prop + registry + jam zona. Sapaan tanpa
 * nama, aktivitas nyata dari createdAt. Reskin "Akhid Noir" ronde-2: kedalaman
 * (elevasi + grain), ikon berbobot, aksen berani, aurora/orb TERLIHAT, reveal
 * bertahap (progressive enhancement — HP & reduced-motion loop/gerak diredam).
 * Kosong → empty-state MENGUNDANG (ilustrasi + ghost card + CTA) + Cara kerja.
 */
export function Beranda({
  history,
  onOpenEntry,
  onStartCreate,
  onSelectTool,
}: BerandaProps) {
  const reduce = useReducedMotion();
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
    <motion.div
      className="flex flex-col gap-6 sm:gap-8"
      variants={listV}
      initial={reduce ? false : 'hidden'}
      animate="show"
    >
      <motion.div variants={itemV}>
        <Hero count={count} onStartCreate={onStartCreate} />
      </motion.div>
      <motion.div variants={itemV}>
        <KotakKebutuhan onSelectTool={onSelectTool} />
      </motion.div>
      <motion.div variants={itemV}>
        <AksiCepat onSelectTool={onSelectTool} />
      </motion.div>

      {count === 0 ? (
        <>
          <motion.div variants={itemV}>
            <RuangKosong onStartCreate={onStartCreate} />
          </motion.div>
          <motion.div variants={itemV}>
            <CaraKerja />
          </motion.div>
        </>
      ) : (
        <>
          <motion.div variants={itemV}>
            <Statistik count={count} breakdown={breakdown} />
          </motion.div>
          <motion.div variants={itemV}>
            <ActivityBars history={history} />
          </motion.div>
          <motion.div variants={itemV}>
            <Terbaru recent={recent} onOpenEntry={onOpenEntry} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
