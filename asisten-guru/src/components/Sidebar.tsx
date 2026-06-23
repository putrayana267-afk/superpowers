import { motion, useReducedMotion } from 'framer-motion';
import { Library, Archive } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TOOLS, getCategories } from '../features/tools/registry';
import { cn } from '../lib/cn';

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  libraryActive: boolean;
  onSelectLibrary: () => void;
  savedActive: boolean;
  onSelectSaved: () => void;
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
  icon: LucideIcon;
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
          ? 'bg-white/80 font-semibold text-emerald-deep shadow-glass'
          : 'text-ink/70 hover:bg-white/50 hover:text-emerald-deep',
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
            ? 'bg-emerald-deep text-white'
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
  libraryActive,
  onSelectLibrary,
  savedActive,
  onSelectSaved,
}: SidebarProps) {
  const reduce = useReducedMotion();
  const categories = getCategories();

  return (
    <nav aria-label="Navigasi" className="flex flex-col gap-5">
      <div>
        <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
          Pustaka & Data
        </h2>
        <ul className="flex flex-col gap-1">
          <li>
            <NavEntry
              active={libraryActive}
              onClick={onSelectLibrary}
              icon={Library}
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
                !libraryActive && !savedActive && tool.id === activeId;
              return (
                <li key={tool.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(tool.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                      active
                        ? 'bg-white/80 font-semibold text-emerald-deep shadow-glass'
                        : 'text-ink/70 hover:bg-white/50 hover:text-emerald-deep',
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
                          ? 'bg-emerald-deep text-white'
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
    </nav>
  );
}
