import { GraduationCap, History, Menu, Sparkles, Settings } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  /** Buka landing showcase (opsional). */
  onOpenShowcase?: () => void;
  /** Buka halaman Pengaturan (opsional). */
  onOpenSettings?: () => void;
}

export function Header({
  onOpenMenu,
  onOpenHistory,
  historyCount,
  onOpenShowcase,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka daftar alat"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-emerald-deep hover:bg-white/10 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-extrabold text-emerald-deep">
              Asisten Mengajar
            </p>
            <p className="hidden text-xs text-ink/50 sm:block">
              Bantuan AI untuk guru Indonesia
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {onOpenShowcase && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenShowcase}
              icon={<Sparkles className="h-4 w-4" />}
              aria-label="Buka showcase"
            >
              <span className="hidden sm:inline">Showcase</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            icon={<History className="h-4 w-4" />}
            aria-label="Buka riwayat"
          >
            <span className="hidden sm:inline">Riwayat</span>
            {historyCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-bold text-ink">
                {historyCount}
              </span>
            )}
          </Button>
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              icon={<Settings className="h-4 w-4" />}
              aria-label="Buka pengaturan"
            >
              <span className="hidden sm:inline">Pengaturan</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
