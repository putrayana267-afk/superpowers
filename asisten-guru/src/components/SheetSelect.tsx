import { startTransition, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import type { MapelGroup } from '../data/struktur';
import { Field } from './Field';
import { cn } from '../lib/cn';
import { useMediaQuery } from '../lib/useMediaQuery';
import { controlBase, controlError } from './controlStyles';

/**
 * Drop-in pengganti `LevelSelect` (PROPS SAMA) untuk satu dropdown saja.
 * Presentasi panel RESPONSIF (kontrak/opsi/manual DIBAGI, tidak diduplikasi):
 * - Mobile (<md): modal tengah + zoom + scrim peredup + scroll-lock body.
 * - Desktop (>=md): popover nempel di bawah field (anchored via rect), tanpa
 *   scrim/scroll-lock, turun-halus dari atas; render via portal agar tak
 *   terpotong stacking context kartu. Kontrak value/opsi/"Lainnya" meniru
 *   LevelSelect 1:1.
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
  /** Prefiks tampilan opsi/nilai (display saja; value tetap mentah). Mis. "Kelas ". */
  labelPrefix?: string;
  /** Izinkan opsi "Lainnya (ketik manual)" + input manual. Default true. */
  allowManual?: boolean;
  /** Field wajib (tanda bintang). Default true. */
  required?: boolean;
  /** Teks placeholder saat belum ada pilihan. Default "— pilih —". */
  placeholder?: string;
}

type PopoverCoords = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
};

export function SheetSelect({
  id,
  label,
  value,
  groups,
  onChange,
  error,
  disabled,
  manualPlaceholder,
  labelPrefix = '',
  allowManual = true,
  required = true,
  placeholder = '— pilih —',
}: SheetSelectProps) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const allItems = groups.flatMap((g) => g.mapel);
  const isCustom = value !== '' && !allItems.includes(value);
  const [manualChosen, setManualChosen] = useState(isCustom);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const showManual = allowManual && (manualChosen || isCustom);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Fokus ke panel saat buka (a11y). Scroll-lock body HANYA mode modal (mobile).
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    if (isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isDesktop]);

  // Desktop popover: tutup saat klik-luar / scroll / resize (paling kokoh).
  useEffect(() => {
    if (!open || !isDesktop) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) {
        return;
      }
      close();
    };
    const onScrollResize = () => close();
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('scroll', onScrollResize);
    window.addEventListener('resize', onScrollResize);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('scroll', onScrollResize);
      window.removeEventListener('resize', onScrollResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isDesktop]);

  const openPanel = () => {
    if (disabled) return;
    if (isDesktop && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const gap = 6;
      const margin = 8;
      const spaceBelow = window.innerHeight - r.bottom;
      const spaceAbove = r.top;
      const below = spaceBelow >= spaceAbove;
      const avail = (below ? spaceBelow : spaceAbove) - gap - margin;
      const maxHeight = Math.max(
        160,
        Math.min(avail, Math.round(window.innerHeight * 0.6)),
      );
      setCoords({
        left: r.left,
        width: r.width,
        maxHeight,
        placement: below ? 'bottom' : 'top',
        ...(below
          ? { top: r.bottom + gap }
          : { bottom: window.innerHeight - r.top + gap }),
      });
    }
    setOpen(true);
  };

  const pilih = (nama: string) => {
    setManualChosen(false);
    close(); // urgent: mulai animasi exit + fokus trigger
    // Cascade reset (berat utk Jenjang/Kelompok: remount Mapel + recompute getMapelGroups/
    // getTopik) sbg transisi NON-URGENT → tak memblok frame exit. Nilai yg dikirim TETAP
    // sama (Kelas "1".."6"); Mapel/Kelas yg ringan praktis seketika (perilaku tak berubah).
    startTransition(() => onChange(nama));
  };

  const pilihManual = () => {
    setManualChosen(true);
    close();
    startTransition(() => onChange(''));
  };

  // Teks trigger meniru LevelSelect: saat manual tampil label "Lainnya…",
  // nilai kustom diketik di <input> bawah.
  const triggerText = showManual
    ? 'Lainnya (ketik manual)'
    : value
      ? `${labelPrefix}${value}`
      : placeholder;
  const triggerMuted = !showManual && value === '';

  // Daftar opsi DIBAGI kedua mode. `wrap`: desktop membungkus nama panjang,
  // mobile tetap truncate (perilaku modal lama).
  const renderOptions = (wrap: boolean) => {
    const textClass = wrap
      ? 'min-w-0 whitespace-normal break-words'
      : 'truncate';
    return (
      <>
        {groups.map((group) => (
          <div key={group.label}>
            {groups.length > 1 && (
              <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
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
                    'flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-left text-base text-ink transition-colors',
                    selected
                      ? 'bg-emerald-deep/10 font-semibold text-emerald-deep'
                      : 'hover:bg-emerald-deep/5',
                  )}
                >
                  <span className={textClass}>{labelPrefix + item}</span>
                  {selected && (
                    <Check className="h-5 w-5 shrink-0 text-emerald-deep" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {allowManual && (
          <button
            type="button"
            role="option"
            aria-selected={showManual}
            onClick={pilihManual}
            className={cn(
              'mt-1 flex w-full items-center justify-between gap-2 rounded-xl border-t border-white/15 px-4 py-3.5 text-left text-base text-ink transition-colors',
              showManual
                ? 'bg-emerald-deep/10 font-semibold text-emerald-deep'
                : 'hover:bg-emerald-deep/5',
            )}
          >
            <span className={textClass}>Lainnya (ketik manual)</span>
            {showManual && (
              <Check className="h-5 w-5 shrink-0 text-emerald-deep" />
            )}
          </button>
        )}
      </>
    );
  };

  const yFrom = coords?.placement === 'top' ? 8 : -8;

  return (
    <Field id={id} label={label} required={required} error={error}>
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
          onClick={openPanel}
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
          {open &&
            (isDesktop && coords ? (
              // DESKTOP — popover nempel di bawah/atas field, tanpa scrim.
              <motion.div
                key="popover"
                ref={panelRef}
                id={`${id}-listbox`}
                role="listbox"
                aria-label={label}
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') close();
                }}
                style={{
                  position: 'fixed',
                  left: coords.left,
                  width: coords.width,
                  top: coords.top,
                  bottom: coords.bottom,
                  maxHeight: coords.maxHeight,
                  transformOrigin:
                    coords.placement === 'bottom' ? 'top' : 'bottom',
                }}
                className="z-[111] overflow-y-auto rounded-2xl border border-white/15 bg-emerald-soft/60 p-2 shadow-glass-lg ring-1 ring-inset ring-white/10 backdrop-blur-2xl backdrop-saturate-150"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: yFrom }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: yFrom }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                }
              >
                {renderOptions(true)}
              </motion.div>
            ) : (
              // MOBILE — modal tengah + zoom + scrim (TIDAK BERUBAH).
              <>
                <motion.div
                  key="scrim"
                  className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[6px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.2 }}
                  onClick={close}
                  aria-hidden
                />
                <motion.div
                  key="modal"
                  ref={panelRef}
                  id={`${id}-listbox`}
                  role="listbox"
                  aria-label={label}
                  tabIndex={-1}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') close();
                  }}
                  className="fixed left-1/2 top-1/2 z-[111] max-h-[75vh] w-[92vw] overflow-y-auto rounded-3xl border border-white/15 bg-emerald-soft/60 p-3 shadow-glass-lg ring-1 ring-inset ring-white/10 backdrop-blur-2xl backdrop-saturate-150 sm:w-[480px] md:w-[560px]"
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
                  <div className="sticky top-0 -mx-3 -mt-3 mb-1 rounded-t-3xl border-b border-white/10 bg-emerald-soft/70 px-4 pb-3 pt-4 backdrop-blur-xl">
                    <p className="text-base font-semibold text-emerald-deep sm:text-lg">
                      {label}
                    </p>
                  </div>
                  {renderOptions(false)}
                </motion.div>
              </>
            ))}
        </AnimatePresence>,
        document.body,
      )}
    </Field>
  );
}
