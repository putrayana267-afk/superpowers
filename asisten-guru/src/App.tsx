import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { TOOLS, getToolById } from './features/tools/registry';
import type { HistoryEntry, Tool, ToolInputs } from './features/tools/types';
import { generate, GenerateError } from './services/ai';
import {
  createId,
  loadHistory,
  saveHistory,
} from './lib/storage';
import { copyToClipboard } from './lib/clipboard';
import { downloadDoc, downloadTxt } from './lib/download';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToolForm } from './components/ToolForm';
import type { ResultStatus } from './components/ResultPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { GlassCard } from './components/GlassCard';
import { ResultSkeleton } from './components/Skeleton';
import { Perpustakaan, PerpustakaanIcon } from './components/Perpustakaan';
import { useToast } from './components/Toast';

type View = 'tools' | 'perpustakaan';

interface AppProps {
  /** Buka kembali landing showcase (opsional, dari Root). */
  onOpenShowcase?: () => void;
}

// react-markdown (pemberat utama) hanya dimuat saat panel hasil dibutuhkan.
const ResultPanel = lazy(() =>
  import('./components/ResultPanel').then((m) => ({ default: m.ResultPanel })),
);

/** Bangun nilai input awal sebuah alat dari skema field-nya. */
function buildDefaults(tool: Tool): ToolInputs {
  const obj: ToolInputs = {};
  for (const field of tool.fields) {
    if (field.type === 'kurikulum') {
      // Field kurikulum mengelola empat kunci turunan.
      obj.jenjang = '';
      obj.kelompok = '';
      obj.mapel = '';
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

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [view, setView] = useState<View>('tools');

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
    setNavOpen(false);
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
    setStatus('loading');
    setError('');
    setResult('');
    setStreaming(false);
    setCurrentEntryId(null);

    try {
      const text = await generate(activeTool.id, inputs);

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
    } catch (err) {
      setStreaming(false);
      const message =
        err instanceof GenerateError
          ? err.message
          : 'Terjadi kesalahan tak terduga. Silakan coba lagi.';
      setError(message);
      setStatus('error');
      toast(message, 'error');
    }
  }, [activeTool, inputs, toast]);

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
    setNavOpen(false);
  }, []);

  const handleOpenEntry = useCallback((entry: HistoryEntry) => {
    setView('tools');
    setActiveId(entry.toolId);
    setInputsByTool((prev) => ({ ...prev, [entry.toolId]: { ...entry.inputs } }));
    setResult(entry.result);
    setStatus('done');
    setStreaming(false);
    setCurrentEntryId(entry.id);
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
    <div className="min-h-screen">
      <Header
        onOpenMenu={() => setNavOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={history.length}
        onOpenShowcase={onOpenShowcase}
      />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24">
            <Sidebar
              activeId={activeId}
              onSelect={handleSelectTool}
              libraryActive={view === 'perpustakaan'}
              onSelectLibrary={handleSelectLibrary}
            />
          </div>
        </aside>

        {/* Area kerja */}
        <main className="min-w-0 flex-1">
          {view === 'perpustakaan' ? (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-deep text-white gold-edge">
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
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-deep text-white gold-edge">
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
                <GlassCard className="h-fit" gold animate>
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
                      status={status}
                      result={result}
                      error={error}
                      isFavorite={isFavorite}
                      streaming={streaming}
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

      {/* Drawer navigasi mobile */}
      <AnimatePresence>
        {navOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
              className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col border-r border-white/40 bg-emerald-soft/95 shadow-glass-lg backdrop-blur-xl"
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
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/50 hover:bg-white/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Sidebar
                  activeId={activeId}
                  onSelect={handleSelectTool}
                  libraryActive={view === 'perpustakaan'}
                  onSelectLibrary={handleSelectLibrary}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
  );
}
