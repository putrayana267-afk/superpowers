import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SquaresFour, Books, Archive, Sparkle } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { TOOLS, getCategories } from '../features/tools/registry';
import { cn } from '../lib/cn';
import {
  loadProfil,
  loadFoto,
  inisialDari,
  DEFAULT_PROFIL,
  type Profil,
} from '../lib/profil';

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  berandaActive: boolean;
  onSelectBeranda: () => void;
  libraryActive: boolean;
  onSelectLibrary: () => void;
  savedActive: boolean;
  onSelectSaved: () => void;
  /** Buka layar hero (Mode Fokus) langsung. Opsional: mengikuti App.onOpenShowcase. */
  onOpenHero?: () => void;
}

function NavEntry({
  active,
  onClick,
  icon: Icon,
  label,
  reduce,
}: {
  active: boolean;
  onClick: () => void;
  icon: Icon;
  label: string;
  reduce: boolean | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
        active
          ? 'bg-white/5 font-semibold text-emerald-deep shadow-glass'
          : 'text-ink/70 hover:bg-white/10 hover:text-emerald-deep',
      )}
    >
      {active && (
        <motion.span
          layoutId={reduce ? undefined : 'sidebar-active'}
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold"
        />
      )}
      <span
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          active
            ? 'bg-brand text-[#04140C]'
            : 'bg-emerald-soft text-emerald-deep group-hover:bg-emerald-deep/10',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/** Daftar navigasi alat, dikelompokkan per kategori. */
export function Sidebar({
  activeId,
  onSelect,
  berandaActive,
  onSelectBeranda,
  libraryActive,
  onSelectLibrary,
  savedActive,
  onSelectSaved,
  onOpenHero,
}: SidebarProps) {
  const reduce = useReducedMotion();
  const categories = getCategories();

  // Profil identitas tersimpan (async) untuk kartu bawah. Default aman saat
  // loading → tak ada "flash kosong".
  const [profil, setProfil] = useState<Profil>(DEFAULT_PROFIL);
  const [foto, setFoto] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadProfil()
      .then((p) => active && setProfil(p))
      .catch(() => {});
    loadFoto()
      .then((f) => active && setFoto(f))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <nav
      aria-label="Navigasi"
      className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#04140C] p-4"
    >
      <div>
        <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
          Pustaka & Data
        </h2>
        <ul className="flex flex-col gap-1">
          <li>
            <NavEntry
              active={berandaActive}
              onClick={onSelectBeranda}
              icon={SquaresFour}
              label="Beranda"
              reduce={reduce}
            />
          </li>
          <li>
            <NavEntry
              active={libraryActive}
              onClick={onSelectLibrary}
              icon={Books}
              label="Perpustakaan"
              reduce={reduce}
            />
          </li>
          <li>
            <NavEntry
              active={savedActive}
              onClick={onSelectSaved}
              icon={Archive}
              label="Tersimpan"
              reduce={reduce}
            />
          </li>
          <li>
            <NavEntry
              active={false}
              onClick={() => onOpenHero?.()}
              icon={Sparkle}
              label="Mode Fokus"
              reduce={reduce}
            />
          </li>
        </ul>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
            {category}
          </h2>
          <ul className="flex flex-col gap-1">
            {TOOLS.filter((t) => t.category === category).map((tool) => {
              const Icon = tool.icon;
              const active =
                !libraryActive && !savedActive && !berandaActive && tool.id === activeId;
              return (
                <li key={tool.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(tool.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                      active
                        ? 'bg-white/5 font-semibold text-emerald-deep shadow-glass'
                        : 'text-ink/70 hover:bg-white/10 hover:text-emerald-deep',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={reduce ? undefined : 'sidebar-active'}
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold"
                      />
                    )}
                    <span
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-brand text-[#04140C]'
                          : 'bg-emerald-soft text-emerald-deep group-hover:bg-emerald-deep/10',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{tool.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-emerald-soft p-3">
        {foto ? (
          <img
            src={foto}
            alt=""
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#4CE896] to-violet font-grotesk text-sm font-bold text-[#04140C]">
            {inisialDari(profil.nama)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-emerald-deep">
            {profil.nama}
          </p>
          <p className="truncate text-xs text-ink/60">{profil.mapel}</p>
        </div>
      </div>
    </nav>
  );
}
