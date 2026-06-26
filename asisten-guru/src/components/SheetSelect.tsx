import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import type { MapelGroup } from '../data/struktur';
import { Field } from './Field';
import { cn } from '../lib/cn';
import { controlBase, controlError } from './controlStyles';

/**
 * Drop-in pengganti `LevelSelect` (PROPS SAMA) untuk satu dropdown saja:
 * trigger bergaya controlBase + panel bottom-sheet beranimasi (framer-motion,
 * via portal ke body agar tak terpotong stacking context kartu). Kontrak
 * value/opsi/"Lainnya (ketik manual)" meniru LevelSelect 1:1.
 */
interface SheetSelectProps {
  id: string;
  label: string;
  value: string;
  groups: MapelGroup[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  manualPlaceholder?: string;
}

export function SheetSelect({
  id,
  label,
  value,
  groups,
  onChange,
  error,
  disabled,
  manualPlaceholder,
}: SheetSelectProps) {
  const reduce = useReducedMotion();
  const allItems = groups.flatMap((g) => g.mapel);
  const isCustom = value !== '' && !allItems.includes(value);
  const [manualChosen, setManualChosen] = useState(isCustom);
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const showManual = manualChosen || isCustom;

  // Fokus ke panel saat buka (a11y). Kunci scroll body selama sheet terbuka.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const pilih = (nama: string) => {
    setManualChosen(false);
    onChange(nama);
    close();
  };

  const pilihManual = () => {
    setManualChosen(true);
    onChange('');
    close();
  };

  // Teks trigger meniru LevelSelect: saat manual tampil label "Lainnya…",
  // nilai kustom diketik di <input> bawah.
  const triggerText = showManual
    ? 'Lainnya (ketik manual)'
    : value || '— pilih —';
  const triggerMuted = !showManual && value === '';

  return (
    <Field id={id} label={label} required error={error}>
      <div className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${id}-listbox` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => !disabled && setOpen(true)}
          className={cn(
            controlBase,
            'flex items-center justify-between pr-10 text-left',
            !disabled && 'cursor-pointer',
            error && controlError,
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className={cn('truncate', triggerMuted && 'text-ink/40')}>
            {triggerText}
          </span>
        </button>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/70"
        />
      </div>

      {showManual && (
        <input
          type="text"
          value={value}
          disabled={disabled}
          placeholder={manualPlaceholder ?? 'Ketik manual…'}
          aria-label={`${label} (ketik manual)`}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlBase, 'mt-2', error && controlError)}
        />
      )}

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="fixed inset-0 z-[110] bg-ink/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.2 }}
                onClick={close}
                aria-hidden
              />
              <motion.div
                ref={panelRef}
                id={`${id}-listbox`}
                role="listbox"
                aria-label={label}
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') close();
                }}
                className="fixed left-1/2 top-1/2 z-[111] max-h-[70vh] w-[min(420px,92vw)] overflow-y-auto rounded-3xl border border-white/40 bg-white/95 p-2 shadow-glass-lg backdrop-blur-xl"
                style={{ transformOrigin: 'center' }}
                initial={
                  reduce
                    ? { x: '-50%', y: '-50%', opacity: 0 }
                    : { x: '-50%', y: '-50%', scale: 0.85, opacity: 0 }
                }
                animate={
                  reduce
                    ? { x: '-50%', y: '-50%', opacity: 1 }
                    : { x: '-50%', y: '-50%', scale: 1, opacity: 1 }
                }
                exit={
                  reduce
                    ? { x: '-50%', y: '-50%', opacity: 0 }
                    : { x: '-50%', y: '-50%', scale: 0.85, opacity: 0 }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.26, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <div className="sticky top-0 -mx-2 -mt-2 mb-1 flex items-center justify-center rounded-t-3xl bg-white/80 px-4 pb-2 pt-3 backdrop-blur">
                  <span className="h-1 w-10 rounded-full bg-ink/15" aria-hidden />
                  <p className="ml-3 text-sm font-semibold text-emerald-deep">
                    {label}
                  </p>
                </div>

                {groups.map((group) => (
                  <div key={group.label}>
                    {groups.length > 1 && (
                      <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
                        {group.label}
                      </p>
                    )}
                    {group.mapel.map((item) => {
                      const selected = value === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => pilih(item)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-ink transition-colors',
                            selected
                              ? 'bg-emerald-deep/10 font-semibold text-emerald-deep'
                              : 'hover:bg-emerald-deep/5',
                          )}
                        >
                          <span className="truncate">{item}</span>
                          {selected && (
                            <Check className="h-4 w-4 shrink-0 text-emerald-deep" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

                <button
                  type="button"
                  role="option"
                  aria-selected={showManual}
                  onClick={pilihManual}
                  className={cn(
                    'mt-1 flex w-full items-center justify-between rounded-xl border-t border-white/40 px-3 py-2.5 text-left text-sm text-ink transition-colors',
                    showManual
                      ? 'bg-emerald-deep/10 font-semibold text-emerald-deep'
                      : 'hover:bg-emerald-deep/5',
                  )}
                >
                  <span className="truncate">Lainnya (ketik manual)</span>
                  {showManual && (
                    <Check className="h-4 w-4 shrink-0 text-emerald-deep" />
                  )}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </Field>
  );
}
