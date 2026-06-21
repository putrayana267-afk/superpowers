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

export type ResultStatus = 'idle' | 'loading' | 'error' | 'done';

interface ResultPanelProps {
  tool: Tool;
  status: ResultStatus;
  result: string;
  error: string;
  isFavorite: boolean;
  onCopy: () => void;
  onDownloadTxt: () => void;
  onDownloadDoc: () => void;
  onRegenerate: () => void;
  onToggleFavorite: () => void;
  onRetry: () => void;
}

export function ResultPanel({
  tool,
  status,
  result,
  error,
  isFavorite,
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
              Menyusun {tool.title.toLowerCase()}…
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

            <div className="prose-result max-w-none flex-1 overflow-y-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
