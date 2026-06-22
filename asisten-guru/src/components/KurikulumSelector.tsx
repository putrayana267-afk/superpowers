import { useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';
import {
  JENJANG_NAMES,
  KELOMPOK_NAMES,
  getMapelGroups,
} from '../data/kurikulum';
import type { MapelGroup } from '../data/kurikulum';
import { Field } from './Field';
import { cn } from '../lib/cn';
import { controlBase, controlError } from './controlStyles';

/** Nilai sentinel untuk opsi "Lainnya (ketik manual)". */
const OTHER = '__lainnya__';

export interface KurikulumValue {
  jenjang: string;
  kelompok: string;
  mapel: string;
  pokok: string;
}

type LevelKey = keyof KurikulumValue;

interface KurikulumSelectorProps {
  value: KurikulumValue;
  onChange: (key: LevelKey, value: string) => void;
  errors?: Partial<Record<LevelKey, string>>;
}

interface LevelSelectProps {
  id: string;
  label: string;
  value: string;
  groups: MapelGroup[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  manualPlaceholder?: string;
}

/** Satu dropdown bertingkat dengan opsi "Lainnya (ketik manual)". */
function LevelSelect({
  id,
  label,
  value,
  groups,
  onChange,
  error,
  disabled,
  manualPlaceholder,
}: LevelSelectProps) {
  const allItems = groups.flatMap((g) => g.mapel);
  // Nilai dianggap manual bila tidak ada di daftar opsi (tetapi tidak kosong).
  const isCustom = value !== '' && !allItems.includes(value);
  const [manualChosen, setManualChosen] = useState(isCustom);

  const showManual = manualChosen || isCustom;
  const selectValue = showManual ? OTHER : value;

  return (
    <Field id={id} label={label} required error={error}>
      <div className="relative">
        <select
          id={id}
          value={selectValue}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            const v = e.target.value;
            if (v === OTHER) {
              setManualChosen(true);
              onChange('');
            } else {
              setManualChosen(false);
              onChange(v);
            }
          }}
          className={cn(
            controlBase,
            'cursor-pointer appearance-none pr-10',
            error && controlError,
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <option value="" disabled>
            — pilih —
          </option>
          {groups.length === 1
            ? groups[0].mapel.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))
            : groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.mapel.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              ))}
          <option value={OTHER}>Lainnya (ketik manual)</option>
        </select>
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
    </Field>
  );
}

/**
 * Pemilih kurikulum bertingkat:
 * Jenjang → Kelompok Kurikulum → Mata Pelajaran/Rumpun Kitab → Pokok Pembahasan.
 * Menulis ke empat kunci input: jenjang, kelompok, mapel, pokok.
 */
export function KurikulumSelector({
  value,
  onChange,
  errors,
}: KurikulumSelectorProps) {
  const jenjangGroups: MapelGroup[] = [
    { label: 'Jenjang', mapel: JENJANG_NAMES },
  ];
  const kelompokGroups: MapelGroup[] = [
    { label: 'Kelompok', mapel: KELOMPOK_NAMES },
  ];
  const mapelGroups = getMapelGroups(value.jenjang, value.kelompok);
  const mapelSiap = mapelGroups.length > 0;

  return (
    <div className="rounded-2xl border border-white/40 bg-white/30 p-4 gold-edge">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-deep">
        <GraduationCap className="h-4 w-4" />
        Kurikulum
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LevelSelect
          id="jenjang"
          label="Jenjang Pendidikan"
          value={value.jenjang}
          groups={jenjangGroups}
          error={errors?.jenjang}
          manualPlaceholder="mis. PAUD/TK"
          onChange={(v) => {
            onChange('jenjang', v);
            onChange('mapel', ''); // mapel umum/madrasah ikut jenjang
          }}
        />
        <LevelSelect
          id="kelompok"
          label="Kelompok Kurikulum"
          value={value.kelompok}
          groups={kelompokGroups}
          error={errors?.kelompok}
          manualPlaceholder="mis. SLB/Inklusi"
          onChange={(v) => {
            onChange('kelompok', v);
            onChange('mapel', ''); // daftar mapel ikut kelompok
          }}
        />
        <LevelSelect
          // remount saat jenjang/kelompok berubah agar mode manual ikut bersih
          key={`mapel-${value.jenjang}-${value.kelompok}`}
          id="mapel"
          label="Mata Pelajaran / Rumpun Kitab"
          value={value.mapel}
          groups={mapelGroups}
          error={errors?.mapel}
          disabled={!mapelSiap}
          manualPlaceholder="mis. nama mata pelajaran"
          onChange={(v) => onChange('mapel', v)}
        />
      </div>

      <div className="mt-4">
        <Field
          id="pokok"
          label="Pokok Pembahasan (Materi/Kitab)"
          required
          error={errors?.pokok}
        >
          <input
            id="pokok"
            type="text"
            value={value.pokok}
            placeholder="cth. Bab Kalam & Kalimat (Matan Al-Jurumiyah)"
            aria-invalid={Boolean(errors?.pokok)}
            aria-describedby={errors?.pokok ? 'pokok-error' : undefined}
            onChange={(e) => onChange('pokok', e.target.value)}
            className={cn(controlBase, errors?.pokok && controlError)}
          />
        </Field>
      </div>
    </div>
  );
}
