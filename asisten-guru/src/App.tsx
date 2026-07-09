import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { IconContext, X, GraduationCap } from '@phosphor-icons/react';
import { TOOLS, getToolById } from './features/tools/registry';
import type { HistoryEntry, Tool, ToolInputs } from './features/tools/types';
import {
  safeParseBankSoal,
  type BankSoal,
  type ValidationResult,
} from './features/tools/bankSoal';
import { validateBankSoal } from './features/tools/validateBankSoal';
import { generate, GenerateError, MissingApiKeyError } from './services/ai';
import { saveGeneration } from './lib/db';
import {
  createId,
  loadHistory,
  saveHistory,
} from './lib/storage';
import { copyToClipboard } from './lib/clipboard';
import { cn } from './lib/cn';
import { downloadDoc, downloadTxt } from './lib/download';
import { EASE_FLOW } from './lib/motion';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToolForm } from './components/ToolForm';
import type { ResultStatus } from './components/ResultPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { GlassCard } from './components/GlassCard';
import { ResultSkeleton } from './components/Skeleton';
import { Perpustakaan, PerpustakaanIcon } from './components/Perpustakaan';
import { Settings, SettingsIcon } from './components/Settings';
import { Tersimpan, TersimpanIcon } from './components/Tersimpan';
import { Beranda } from './components/Beranda';
import type { GenerationRow } from './lib/db';
import { useToast } from './components/Toast';

type View = 'tools' | 'perpustakaan' | 'settings' | 'tersimpan' | 'beranda';

interface AppProps {
  /** Buka kembali landing showcase (opsional, dari Root). */
  onOpenShowcase?: () => void;
}

// react-markdown (pemberat utama) hanya dimuat saat panel hasil dibutuhkan.
const ResultPanel = lazy(() =>
  import('./components/ResultPanel').then((m) => ({ default: m.ResultPanel })),
);

/** Batas lunak total soal per permintaan bank-soal (A1). >20 → arahkan per bagian. */
const SOFT_CAP_TOTAL = 20;

/** Hitung jumlah diminta bank-soal dari inputs (bilangan bulat ≥ 0). */
function jumlahDimintaBankSoal(inputs: ToolInputs | undefined): {
  pg: number;
  isian: number;
  esai: number;
} {
  const n = (k: string): number => {
    const v = Math.floor(Number(inputs?.[k] ?? ''));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  return { pg: n('jumlahPg'), isian: n('jumlahIsian'), esai: n('jumlahEsai') };
}

/**
 * Muat-ulang hasil bank-soal tersimpan (Tahap 6). Menentukan penyajian:
 * - envelope JSON v1 valid    → { bankSoal } (BankSoalView; Sumber + Draft AI dari view)
 * - JSON tapi bukan envelope   → { bankSoalError } (banner jujur + raw fallback)
 * - bukan JSON (markdown lama)  → keduanya null (Markdown + badge Legacy di ResultPanel)
 * Tidak pernah mengklaim "verified".
 */
function parseSavedBankSoal(result: string): {
  bankSoal: { data: BankSoal; validation: ValidationResult } | null;
  bankSoalError: string | null;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(result);
  } catch {
    return { bankSoal: null, bankSoalError: null };
  }
  const env = parsed as {
    schemaVersion?: unknown;
    jumlahDiminta?: { pg: number; isian: number; esai: number };
    soal?: BankSoal;
  };
  if (env.schemaVersion !== 'bank-soal-json-v1' || !env.soal) {
    return { bankSoal: null, bankSoalError: 'Format tersimpan tak dikenali.' };
  }
  try {
    const validation = validateBankSoal(
      env.soal,
      env.jumlahDiminta ?? { pg: 0, isian: 0, esai: 0 },
    );
    return { bankSoal: { data: env.soal, validation }, bankSoalError: null };
  } catch {
    return { bankSoal: null, bankSoalError: 'Format tersimpan tak dikenali.' };
  }
}

/** Bangun nilai input awal sebuah alat dari skema field-nya. */
function buildDefaults(tool: Tool): ToolInputs {
  const obj: ToolInputs = {};
  for (const field of tool.fields) {
    if (field.type === 'kurikulum') {
      // Field kurikulum mengelola kunci turunan ini.
      obj.jenjang = '';
      obj.kelompok = '';
      obj.mapel = '';
      obj.kelas = '';
      obj.pokok = '';
    } else if (field.type === 'select') {
      obj[field.id] = field.defaultValue ?? field.options?.[0]?.value ?? '';
    } else if (field.type === 'toggle') {
      obj[field.id] = field.defaultValue ?? 'false';
    } else {
      obj[field.id] = field.defaultValue ?? '';
    }
  }
  return obj;
}

function buildAllDefaults(): Record<string, ToolInputs> {
  const map: Record<string, ToolInputs> = {};
  for (const tool of TOOLS) {
    map[tool.id] = buildDefaults(tool);
  }
  return map;
}

export default function App({ onOpenShowcase }: AppProps) {
  const { toast } = useToast();

  const [activeId, setActiveId] = useState<string>(TOOLS[0].id);
  const [inputsByTool, setInputsByTool] = useState<
    Record<string, ToolInputs>
  >(buildAllDefaults);

  const [status, setStatus] = useState<ResultStatus>('idle');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  // Bank Soal (mode JSON v2.1): hasil parse+validasi & alasan gagal parse.
  const [bankSoal, setBankSoal] = useState<{
    data: BankSoal;
    validation: ValidationResult;
  } | null>(null);
  const [bankSoalError, setBankSoalError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [view, setView] = useState<View>('tools');

  // Otoritas animasi tunggal drawer (selalu ter-mount; tanpa AnimatePresence)
  // — menghilangkan balapan AnimatePresence×drag.
  const drawerControls = useAnimationControls();
  useEffect(() => {
    drawerControls.start({
      x: navOpen ? 0 : '-105%',
      transition: { type: 'tween', duration: 0.5, ease: EASE_FLOW },
    });
  }, [navOpen, drawerControls]);

  const activeTool = getToolById(activeId) ?? TOOLS[0];
  const inputs = inputsByTool[activeId];

  // Muat riwayat sekali saat mount.
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Simpan riwayat tiap kali berubah.
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const isFavorite = useMemo(() => {
    if (!currentEntryId) return false;
    return history.find((e) => e.id === currentEntryId)?.favorite ?? false;
  }, [currentEntryId, history]);

  const handleSelectTool = useCallback((id: string) => {
    setView('tools');
    setActiveId(id);
    setStatus('idle');
    setResult('');
    setError('');
    setCurrentEntryId(null);
    setBankSoal(null);
    setBankSoalError(null);
    // Drawer SENGAJA tidak ditutup: pilih alat mengganti konten di belakang,
    // pengguna menutup via geser-kiri, tombol X, atau ketuk scrim.
  }, []);

  const handleChange = useCallback(
    (fieldId: string, value: string) => {
      setInputsByTool((prev) => ({
        ...prev,
        [activeId]: { ...prev[activeId], [fieldId]: value },
      }));
    },
    [activeId],
  );

  const runGenerate = useCallback(async () => {
    const isBankSoal = activeTool.id === 'bank-soal';
    const diminta = jumlahDimintaBankSoal(inputs);

    // GUARD bank-soal sebelum memanggil AI (A1): total 0 & >20 dicegah di client.
    if (isBankSoal) {
      const total = diminta.pg + diminta.isian + diminta.esai;
      if (total === 0) {
        toast(
          'Isi jumlah soal minimal satu (Pilihan Ganda, Isian, atau Esai).',
          'info',
        );
        return;
      }
      if (total > SOFT_CAP_TOTAL) {
        toast(
          `Maksimal ${SOFT_CAP_TOTAL} soal per permintaan. Untuk lebih banyak, buat per bagian.`,
          'info',
        );
        return;
      }
    }

    setStatus('loading');
    setError('');
    setResult('');
    setStreaming(false);
    setCurrentEntryId(null);
    setBankSoal(null);
    setBankSoalError(null);

    try {
      const text = await generate(activeTool.id, inputs);

      // Bank Soal: parse + validasi di CLIENT (server hanya kirim JSON string).
      if (isBankSoal) {
        const parsed = safeParseBankSoal(text);
        if (!parsed.ok) {
          // JSON invalid/terpotong → error jujur + fallback mentah. TIDAK disimpan.
          setResult(text);
          setBankSoal(null);
          setBankSoalError(parsed.reason);
          setStatus('done');
          setStreaming(false);
          setCurrentEntryId(null);
          return;
        }
        const validation = validateBankSoal(parsed.data, diminta);
        // Envelope simpan (R2) — BUKAN raw JSON string.
        const envelope = JSON.stringify({
          schemaVersion: 'bank-soal-json-v1',
          jumlahDiminta: diminta,
          soal: parsed.data,
        });
        setResult(envelope);
        setBankSoal({ data: parsed.data, validation });
        setBankSoalError(null);
        setStatus('done');
        setStreaming(false);

        const entryBS: HistoryEntry = {
          id: createId(),
          toolId: activeTool.id,
          toolTitle: activeTool.title,
          inputs: { ...inputs },
          result: envelope,
          createdAt: Date.now(),
          favorite: false,
        };
        setCurrentEntryId(entryBS.id);
        setHistory((prev) => [entryBS, ...prev]);
        // Simpan envelope (termasuk bila ada issue struktur = riwayat draft bermasalah).
        void saveGeneration({
          tool: activeTool.id,
          title: activeTool.title,
          subject: inputs.mapel ?? '',
          grade: inputs.jenjang ?? '',
          inputJson: JSON.stringify(inputs),
          outputText: envelope,
          createdAt: entryBS.createdAt,
        }).catch((e) => console.error('Gagal menyimpan ke SQLite:', e));
        return;
      }

      setResult(text);
      setStatus('done');
      setStreaming(false);

      const entry: HistoryEntry = {
        id: createId(),
        toolId: activeTool.id,
        toolTitle: activeTool.title,
        inputs: { ...inputs },
        result: text,
        createdAt: Date.now(),
        favorite: false,
      };
      setCurrentEntryId(entry.id);
      setHistory((prev) => [entry, ...prev]);

      // Simpan SETIAP hasil sukses ke SQLite (lokal/offline).
      void saveGeneration({
        tool: activeTool.id,
        title: activeTool.title,
        subject: inputs.mapel ?? '',
        grade: inputs.jenjang ?? '',
        inputJson: JSON.stringify(inputs),
        outputText: text,
        createdAt: entry.createdAt,
      }).catch((e) => console.error('Gagal menyimpan ke SQLite:', e));
    } catch (err) {
      setStreaming(false);
      // Key BYOK belum diisi (native) → arahkan ke Pengaturan.
      if (err instanceof MissingApiKeyError) {
        setStatus('idle');
        setView('settings');
        toast(err.message, 'info');
        return;
      }
      const message =
        err instanceof GenerateError
          ? err.message
          : 'Terjadi kesalahan tak terduga. Silakan coba lagi.';
      setError(message);
      setStatus('error');
      toast(message, 'error');
    }
  }, [activeTool, inputs, toast]);

  const handleOpenSettings = useCallback(() => {
    setView('settings');
    setNavOpen(false);
  }, []);

  const handleSelectSaved = useCallback(() => {
    setView('tersimpan');
  }, []);

  const handleOpenSaved = useCallback((row: GenerationRow) => {
    let parsed: ToolInputs = {};
    try {
      parsed = JSON.parse(row.input_json) as ToolInputs;
    } catch {
      parsed = {};
    }
    setView('tools');
    setActiveId(row.tool);
    if (Object.keys(parsed).length > 0) {
      setInputsByTool((prev) => ({ ...prev, [row.tool]: parsed }));
    }
    setResult(row.output_text);
    setStatus('done');
    setStreaming(false);
    setCurrentEntryId(null);
    // Muat-ulang bank-soal (Tahap 6): envelope→BankSoalView · JSON off-contract→error ·
    // markdown lama→Markdown + badge Legacy. Tool lain: tak berubah.
    if (row.tool === 'bank-soal') {
      const hydrated = parseSavedBankSoal(row.output_text);
      setBankSoal(hydrated.bankSoal);
      setBankSoalError(hydrated.bankSoalError);
    } else {
      setBankSoal(null);
      setBankSoalError(null);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(result);
    toast(
      ok ? 'Hasil tersalin ke papan klip.' : 'Gagal menyalin. Coba lagi.',
      ok ? 'success' : 'error',
    );
  }, [result, toast]);

  const handleDownloadTxt = useCallback(() => {
    downloadTxt(activeTool.title, result);
    toast('Berkas .txt sedang diunduh.', 'success');
  }, [activeTool.title, result, toast]);

  const handleDownloadDoc = useCallback(() => {
    downloadDoc(activeTool.title, result);
    toast('Berkas Word sedang diunduh.', 'success');
  }, [activeTool.title, result, toast]);

  const handleToggleFavoriteCurrent = useCallback(() => {
    if (!currentEntryId) return;
    setHistory((prev) =>
      prev.map((e) =>
        e.id === currentEntryId ? { ...e, favorite: !e.favorite } : e,
      ),
    );
  }, [currentEntryId]);

  const handleSelectLibrary = useCallback(() => {
    setView('perpustakaan');
  }, []);

  const handleSelectBeranda = useCallback(() => {
    setView('beranda');
  }, []);

  const handleOpenEntry = useCallback((entry: HistoryEntry) => {
    setView('tools');
    setActiveId(entry.toolId);
    setInputsByTool((prev) => ({ ...prev, [entry.toolId]: { ...entry.inputs } }));
    setResult(entry.result);
    setStatus('done');
    setStreaming(false);
    setCurrentEntryId(entry.id);
    if (entry.toolId === 'bank-soal') {
      const hydrated = parseSavedBankSoal(entry.result);
      setBankSoal(hydrated.bankSoal);
      setBankSoalError(hydrated.bankSoalError);
    } else {
      setBankSoal(null);
      setBankSoalError(null);
    }
    setHistoryOpen(false);
    setNavOpen(false);
  }, []);

  const handleToggleFavoriteEntry = useCallback((id: string) => {
    setHistory((prev) =>
      prev.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e)),
    );
  }, []);

  const handleDeleteEntry = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((e) => e.id !== id));
      if (id === currentEntryId) setCurrentEntryId(null);
    },
    [currentEntryId],
  );

  const handleClearAll = useCallback(() => {
    setHistory([]);
    setCurrentEntryId(null);
  }, []);

  const ActiveIcon = activeTool.icon;

  return (
    <IconContext.Provider value={{ weight: 'duotone' }}>
    <div className="min-h-screen">
      <Header
        onOpenMenu={() => setNavOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={history.length}
        onOpenSettings={handleOpenSettings}
      />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24">
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#04140C] p-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-base font-extrabold text-emerald-deep">
                  Asisten Mengajar
                </p>
                <p className="text-xs text-ink/50">
                  Bantuan AI untuk guru Indonesia
                </p>
              </div>
            </div>
            <Sidebar
              activeId={activeId}
              onSelect={handleSelectTool}
              berandaActive={view === 'beranda'}
              onSelectBeranda={handleSelectBeranda}
              libraryActive={view === 'perpustakaan'}
              onSelectLibrary={handleSelectLibrary}
              savedActive={view === 'tersimpan'}
              onSelectSaved={handleSelectSaved}
              onOpenHero={onOpenShowcase}
            />
          </div>
        </aside>

        {/* Area kerja */}
        <main className="min-w-0 flex-1">
          {view === 'beranda' ? (
            <Beranda
              history={history}
              onOpenEntry={handleOpenEntry}
              onStartCreate={() => setView('tools')}
              onSelectTool={handleSelectTool}
            />
          ) : view === 'settings' ? (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
                    <SettingsIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h1 className="font-display text-xl font-extrabold text-emerald-deep sm:text-2xl">
                      Pengaturan
                    </h1>
                    <p className="text-sm text-ink/60">
                      Kelola Gemini API key Anda (tersimpan di perangkat).
                    </p>
                  </div>
                </div>
              </div>
              <Settings />
            </>
          ) : view === 'tersimpan' ? (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
                    <TersimpanIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h1 className="font-display text-xl font-extrabold text-emerald-deep sm:text-2xl">
                      Tersimpan
                    </h1>
                    <p className="text-sm text-ink/60">
                      Semua hasil tersimpan di perangkat — bisa dibuka kembali
                      walau offline.
                    </p>
                  </div>
                </div>
              </div>
              <Tersimpan onOpen={handleOpenSaved} />
            </>
          ) : view === 'perpustakaan' ? (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
                    <PerpustakaanIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h1 className="font-display text-xl font-extrabold text-emerald-deep sm:text-2xl">
                      Perpustakaan
                    </h1>
                    <p className="text-sm text-ink/60">
                      Tautan referensi resmi buku & kitab. Dibuka di tab baru.
                    </p>
                  </div>
                </div>
              </div>
              <Perpustakaan />
            </>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
                    <ActiveIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h1 className="font-display text-xl font-extrabold text-emerald-deep sm:text-2xl">
                      {activeTool.title}
                    </h1>
                    <p className="text-sm text-ink/60">
                      {activeTool.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GlassCard className="h-fit border border-white/10" animate>
                  <ToolForm
                    tool={activeTool}
                    inputs={inputs}
                    onChange={handleChange}
                    onSubmit={runGenerate}
                    loading={status === 'loading'}
                  />
                </GlassCard>

                <GlassCard className="min-h-[420px]" animate>
                  <Suspense fallback={<ResultSkeleton />}>
                    <ResultPanel
                      tool={activeTool}
                      resultTitle={[activeTool.title, inputs?.mapel]
                        .filter(Boolean)
                        .join(' ')}
                      status={status}
                      result={result}
                      error={error}
                      isFavorite={isFavorite}
                      streaming={streaming}
                      bankSoal={bankSoal}
                      bankSoalError={bankSoalError}
                      onCopy={handleCopy}
                      onDownloadTxt={handleDownloadTxt}
                      onDownloadDoc={handleDownloadDoc}
                      onRegenerate={runGenerate}
                      onToggleFavorite={handleToggleFavoriteCurrent}
                      onRetry={runGenerate}
                    />
                  </Suspense>
                </GlassCard>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Drawer navigasi mobile — selalu ter-mount; animasi via drawerControls */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          !navOpen && 'pointer-events-none',
        )}
      >
        <motion.div
          animate={{ opacity: navOpen ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE_FLOW }}
          style={{ pointerEvents: navOpen ? 'auto' : 'none' }}
          onClick={() => setNavOpen(false)}
          className="absolute inset-0 bg-black/50"
          aria-hidden
        />
        <motion.div
          initial={{ x: '-105%' }}
          animate={drawerControls}
          drag={navOpen ? 'x' : false}
          dragConstraints={{ left: -288, right: 0 }}
          dragElastic={0.04}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -70 || info.velocity.x < -600) {
              setNavOpen(false);
            } else {
              drawerControls.start({
                x: 0,
                transition: { type: 'tween', duration: 0.5, ease: EASE_FLOW },
              });
            }
          }}
          className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col border-r border-white/40 bg-emerald-soft/95 shadow-glass-lg"
          role="dialog"
          aria-label="Daftar alat"
        >
          <div className="flex items-center justify-between border-b border-white/40 px-4 py-4">
            <span className="font-display font-bold text-emerald-deep">
              Pilih Alat
            </span>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Tutup menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/50 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Sidebar
              activeId={activeId}
              onSelect={handleSelectTool}
              berandaActive={view === 'beranda'}
              onSelectBeranda={handleSelectBeranda}
              libraryActive={view === 'perpustakaan'}
              onSelectLibrary={handleSelectLibrary}
              savedActive={view === 'tersimpan'}
              onSelectSaved={handleSelectSaved}
              onOpenHero={onOpenShowcase}
            />
          </div>
        </motion.div>
      </div>

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={history}
        onOpenEntry={handleOpenEntry}
        onToggleFavorite={handleToggleFavoriteEntry}
        onDelete={handleDeleteEntry}
        onClearAll={handleClearAll}
      />
    </div>
    </IconContext.Provider>
  );
}
