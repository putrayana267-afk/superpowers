import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Download, RefreshCw, Star } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { Button } from './Button'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'
import { copyToClipboard } from '../lib/clipboard'
import { downloadTxt, sanitizeFilename } from '../lib/download'
import { useToast } from './Toast'

interface ResultPanelProps {
  result: string
  toolTitle: string
  isLoading: boolean
  isFavorite: boolean
  onRegenerate: () => void
  onToggleFavorite: () => void
}

export function ResultPanel({
  result,
  toolTitle,
  isLoading,
  isFavorite,
  onRegenerate,
  onToggleFavorite,
}: ResultPanelProps) {
  const { showToast } = useToast()

  const handleCopy = async () => {
    try {
      await copyToClipboard(result)
      showToast('Hasil berhasil disalin ke clipboard!', 'success')
    } catch {
      showToast('Gagal menyalin. Coba salin manual.', 'error')
    }
  }

  const handleDownload = () => {
    const filename = sanitizeFilename(toolTitle)
    downloadTxt(result, filename)
    showToast('File berhasil diunduh.', 'success')
  }

  return (
    <GlassCard className="flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <h3 className="font-display font-semibold text-white text-sm">Hasil</h3>
        {result && !isLoading && (
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFavorite}
              aria-label={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              title={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Star
                className={`w-4 h-4 transition-colors ${isFavorite ? 'text-gold fill-gold' : 'text-white/40'}`}
              />
            </button>
            <button
              onClick={handleCopy}
              aria-label="Salin hasil ke clipboard"
              title="Salin"
              className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Copy className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={handleDownload}
              aria-label="Unduh hasil sebagai file teks"
              title="Unduh .txt"
              className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Download className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={onRegenerate}
              aria-label="Buat ulang hasil"
              title="Buat Ulang"
              className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <RefreshCw className="w-4 h-4 text-white/60" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Skeleton />
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-5"
            >
              <div className="overflow-x-auto">
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="w-3.5 h-3.5" />
                  Salin
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" />
                  Unduh .txt
                </Button>
                <Button variant="ghost" size="sm" onClick={onRegenerate}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Buat Ulang
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState toolTitle={toolTitle} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}
