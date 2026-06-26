import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  RefreshCw,
  FileText,
  FileType2,
  Star,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import type { Tool } from '../features/tools/types';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { ResultSkeleton } from './Skeleton';
import BlurText from './BlurText';

export type ResultStatus = 'idle' | 'loading' | 'error' | 'done';

interface ResultPanelProps {
  tool: Tool;
  /** Judul hasil (mis. "Modul Ajar Matematika") — dianimasi reveal saat done. */
  resultTitle: string;
  status: ResultStatus;
  result: string;
  error: string;
  isFavorite: boolean;
  /** True saat teks masih mengalir (streaming) — toolbar disembunyikan. */
  streaming: boolean;
  onCopy: () => void;
  onDownloadTxt: () => void;
  onDownloadDoc: () => void;
  onRegenerate: () => void;
  onToggleFavorite: () => void;
  onRetry: () => void;
}

export function ResultPanel({
  tool,
  resultTitle,
  status,
  result,
  error,
  isFavorite,
  streaming,
  onCopy,
  onDownloadTxt,
  onDownloadDoc,
  onRegenerate,
  onToggleFavorite,
  onRetry,
}: ResultPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-1"
            role="status"
            aria-live="polite"
          >
            <p className="mb-4 text-sm font-medium text-emerald-deep/70">
              Menyusun {tool.title.toLowerCase()}… mohon tunggu sebentar ya.
            </p>
            <ResultSkeleton />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<WifiOff className="h-7 w-7" />}
              title="Belum berhasil dibuat"
              description={error}
              action={
                <Button
                  onClick={onRetry}
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Coba Lagi
                </Button>
              }
            />
          </motion.div>
        )}

        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<Sparkles className="h-7 w-7" />}
              title="Hasil akan muncul di sini"
              description={`Isi formulir di samping, lalu tekan "${tool.ctaLabel ?? 'Buat'}". Hasilnya bisa Anda salin, unduh, dan simpan ke favorit.`}
            />
          </motion.div>
        )}

        {status === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col"
          >
            <h2 className="mb-3 font-display text-xl font-extrabold text-emerald-deep sm:text-2xl">
              <BlurText text={resultTitle} />
            </h2>

            {streaming ? (
              <div
                className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-deep/10 px-3 py-1.5 text-xs font-semibold text-emerald-deep"
                role="status"
                aria-live="polite"
              >
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-primary" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-primary [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-primary [animation-delay:300ms]" />
                </span>
                Sedang menulis…
              </div>
            ) : (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={onCopy}
                icon={<Copy className="h-4 w-4" />}
              >
                Salin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadTxt}
                icon={<FileText className="h-4 w-4" />}
              >
                .txt
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadDoc}
                icon={<FileType2 className="h-4 w-4" />}
              >
                Word
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Buat Ulang
              </Button>
              <Button
                variant={isFavorite ? 'gold' : 'subtle'}
                size="sm"
                onClick={onToggleFavorite}
                aria-pressed={isFavorite}
                aria-label={
                  isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'
                }
                icon={
                  <Star
                    className="h-4 w-4"
                    fill={isFavorite ? 'currentColor' : 'none'}
                  />
                }
              >
                {isFavorite ? 'Favorit' : 'Simpan'}
              </Button>
            </div>
            )}

            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-800 backdrop-blur">
              <span aria-hidden className="mt-px">
                ⚠️
              </span>
              <p>
                Dibuat oleh AI sebagai draft. Mohon periksa &amp; sesuaikan
                sebelum dipakai — terutama kunci jawaban, dalil/teks Arab, dan
                kesesuaian kurikulum.
              </p>
            </div>

            <div className="prose-result max-w-none flex-1 overflow-y-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              {streaming && (
                <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-emerald-primary align-text-bottom" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
