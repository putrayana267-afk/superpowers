import { startTransition, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { MapelGroup } from '../data/struktur';
import { Field } from './Field';
import { cn } from '../lib/cn';
import { useMediaQuery } from '../lib/useMediaQuery';
import { controlBase, controlError } from './controlStyles';
import { EASE_FLOW } from '../lib/motion';

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

/** Kandidat pilihan konfirmasi 2-ketukan: opsi nyata, mode manual, atau kosong. */
type Pending =
  | { kind: 'item'; value: string }
  | { kind: 'manual' }
  | null;

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
  // Konfirmasi 2-ketukan: ketuk opsi hanya menandai `pending`; hanya tombol
  // "Terapkan" yang meng-commit ke onChange. null = belum ada kandidat.
  const [pending, setPending] = useState<Pending>(null);

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
    // Pra-sorot pilihan yang sedang aktif sebagai kandidat awal (mode manual,
    // opsi terpilih, atau kosong bila belum memilih).
    setPending(
      showManual
        ? { kind: 'manual' }
        : value !== ''
          ? { kind: 'item', value }
          : null,
    );
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

  // Commit kandidat (ketukan kedua). Selalu tutup; panggil onChange HANYA bila
  // pilihan benar-benar berubah — menjaga kontrak cascade (onChange Jenjang/
  // Kelompok me-reset turunan), agar konfirmasi tanpa-perubahan tak menghapus
  // Mapel/Kelas/Pokok yang sudah dipilih.
  const terapkan = () => {
    if (!pending) return;
    close(); // urgent: mulai animasi exit + fokus trigger
    if (pending.kind === 'manual') {
      if (showManual) return; // sudah mode manual → cukup tutup, nilai dipertahankan
      setManualChosen(true);
      // Cascade reset (berat utk Jenjang/Kelompok: remount Mapel + recompute
      // getMapelGroups/getTopik) sbg transisi NON-URGENT → tak memblok frame exit.
      startTransition(() => onChange(''));
      return;
    }
    // pending.kind === 'item'
    if (!showManual && pending.value === value) return; // tak berubah → tak commit ulang
    setManualChosen(false);
    startTransition(() => onChange(pending.value));
  };

  // Teks trigger meniru LevelSelect: saat manual tampil label "Lainnya…",
  // nilai kustom diketik di <input> bawah.
  const triggerText = showManual
    ? 'Lainnya (ketik manual)'
    : value
      ? `${labelPrefix}${value}`
      : placeholder;
  const triggerMuted = !showManual && value === '';

  // Kelas visual "terpilih" (tint aksen, garis kiri, centang) — DIBAGI opsi &
  // manual. Sorotan mengikuti `pending` (kandidat), bukan lagi `value`.
  const rowSelected =
    'border border-[rgba(76,232,150,0.28)] bg-[rgba(76,232,150,0.10)] font-semibold text-ink';
  const rowIdle =
    'border border-transparent text-ink/90 hover:bg-white/[0.06] active:bg-white/[0.10]';
  const accentLine = (
    <span
      aria-hidden
      className="absolute left-1.5 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-brand"
    />
  );

  // Daftar opsi DIBAGI kedua mode. `wrap`: desktop membungkus nama panjang,
  // mobile tetap truncate (perilaku modal lama). Jarak antar-baris ~6px.
  const renderOptions = (wrap: boolean) => {
    const textClass = wrap
      ? 'min-w-0 whitespace-normal break-words'
      : 'truncate';
    const manualSelected = pending !== null && pending.kind === 'manual';
    return (
      <div className="space-y-1.5">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {groups.length > 1 && (
              <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-label">
                {group.label}
              </p>
            )}
            {group.mapel.map((item) => {
              const selected =
                pending !== null &&
                pending.kind === 'item' &&
                pending.value === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setPending({ kind: 'item', value: item })}
                  className={cn(
                    'relative flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-left text-base transition-colors',
                    selected ? rowSelected : rowIdle,
                  )}
                >
                  {selected && accentLine}
                  <span className={textClass}>{labelPrefix + item}</span>
                  {selected && (
                    <Check className="h-5 w-5 shrink-0 text-brand-icon" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {allowManual && (
          <>
            <div aria-hidden className="mx-2 border-t border-white/10" />
            <button
              type="button"
              role="option"
              aria-selected={manualSelected}
              onClick={() => setPending({ kind: 'manual' })}
              className={cn(
                'relative flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-left text-base transition-colors',
                manualSelected ? rowSelected : rowIdle,
              )}
            >
              {manualSelected && accentLine}
              <span className={textClass}>Lainnya (ketik manual)</span>
              {manualSelected && (
                <Check className="h-5 w-5 shrink-0 text-brand-icon" />
              )}
            </button>
          </>
        )}
      </div>
    );
  };

  // Footer sticky — tombol Terapkan (commit kandidat). AKTIF hanya saat pending.
  // `bleed` menembus padding panel agar rata tepi (mis. '-mx-3 -mb-3').
  const renderFooter = (bleed: string) => (
    <div
      className={cn(
        'sticky bottom-0 z-10 mt-1.5 border-t border-white/10 px-4 pb-3 pt-3',
        bleed,
      )}
    >
      <button
        type="button"
        disabled={pending === null}
        onClick={terapkan}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition-opacity',
          pending !== null
            ? 'border border-transparent bg-brand text-on-fill hover:opacity-90 active:opacity-80'
            : 'cursor-not-allowed border border-white/[0.12] bg-transparent text-ink/40',
        )}
      >
        <Check className="h-5 w-5" />
        Terapkan
      </button>
    </div>
  );

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
        <CaretDown
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
                className="z-[111] overflow-y-auto rounded-[28px] border border-white/15 bg-sheet p-2 backdrop-blur-lg backdrop-saturate-[1.6] shadow-[0_28px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
                }
              >
                {renderOptions(true)}
                {renderFooter('-mx-2 -mb-2')}
              </motion.div>
            ) : (
              // MOBILE — modal tengah + grow-in scale + scrim.
              <>
                <motion.div
                  key="scrim"
                  className="fixed inset-0 z-[110] bg-[radial-gradient(120%_90%_at_20%_15%,rgba(52,190,130,0.28),transparent_55%),radial-gradient(110%_80%_at_85%_75%,rgba(56,180,205,0.18),transparent_55%),linear-gradient(rgba(0,0,0,0.32),rgba(0,0,0,0.32))] backdrop-blur-sm backdrop-saturate-150"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.24, ease: EASE_FLOW }}
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
                  className="fixed left-1/2 top-1/2 z-[111] max-h-[75vh] w-[92vw] overflow-y-auto rounded-[28px] border border-white/15 bg-sheet p-3 backdrop-blur-lg backdrop-saturate-[1.6] shadow-[0_28px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] sm:w-[480px] md:w-[560px]"
                  style={{ transformOrigin: 'center' }}
                  initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.96 }}
                  animate={{ x: '-50%', y: '-50%', opacity: 1, scale: 1 }}
                  exit={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.96 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.24, ease: EASE_FLOW }
                  }
                >
                  <div className="sticky top-0 z-10 -mx-3 -mt-3 mb-2 border-b border-white/10 px-4 pb-3 pt-4">
                    <p className="text-base font-semibold text-ink sm:text-lg">
                      {label}
                    </p>
                  </div>
                  {renderOptions(false)}
                  {renderFooter('-mx-3 -mb-3')}
                </motion.div>
              </>
            ))}
        </AnimatePresence>,
        document.body,
      )}
    </Field>
  );
}
