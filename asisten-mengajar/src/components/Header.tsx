import { Menu, History, GraduationCap } from 'lucide-react'

interface HeaderProps {
  onMenuToggle: () => void
  onHistoryToggle: () => void
  currentToolTitle: string
}

export function Header({ onMenuToggle, onHistoryToggle, currentToolTitle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16">
      <div className="glass border-b border-white/10 h-full px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            aria-label="Buka menu navigasi"
            className="md:hidden flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg hidden sm:block">
              Asisten Mengajar
            </span>
          </div>
          {currentToolTitle && (
            <div className="hidden md:flex items-center gap-2 text-sm text-emerald-300/70 min-w-0">
              <span>/</span>
              <span className="truncate">{currentToolTitle}</span>
            </div>
          )}
        </div>

        <button
          onClick={onHistoryToggle}
          aria-label="Buka riwayat dan favorit"
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-emerald-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:block">Riwayat</span>
        </button>
      </div>
    </header>
  )
}
