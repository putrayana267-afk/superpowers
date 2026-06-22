import { BookOpen } from 'lucide-react'

interface EmptyStateProps {
  toolTitle: string
}

export function EmptyState({ toolTitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-emerald-400/60" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display font-semibold text-white">Siap membuat {toolTitle}</h3>
        <p className="text-sm text-emerald-300/60 max-w-xs">
          Isi form di sebelah kiri lalu tekan <strong className="text-emerald-300">Buat Sekarang</strong> — hasilnya akan muncul di sini dalam hitungan detik.
        </p>
      </div>
    </div>
  )
}
