import { useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';
import {
  JENJANG_NAMES,
  KELOMPOK_NAMES,
  KELOMPOK_PESANTREN,
  getMapelGroups,
  getKelasOptions,
} from '../data/struktur';
import type { MapelGroup } from '../data/struktur';
import { getTopik } from '../data/kurikulum';
import type { Topik } from '../data/kurikulum';
import { Field } from './Field';
import { FieldSuggest } from './FieldSuggest';
import { cn } from '../lib/cn';
import { controlBase, controlError } from './controlStyles';

const POKOK_INSTRUCTION =
  'Berikan 6-8 topik/bab pembelajaran yang RELEVAN dan runtut untuk konteks di atas ' +
  '(jenjang, kelompok kurikulum, mata pelajaran). Untuk Kekhasan Pesantren, sebutkan ' +
  'bab/kitab yang lazim dipelajari. Jawab HANYA daftar, satu topik per baris, tanpa nomor, ' +
  'tanpa penjelasan tambahan.';

/** Nilai sentinel untuk opsi "Lainnya (ketik manual)". */
const OTHER = '__lainnya__';
/** Sentinel untuk opsi "Tulis Kustom Pembahasan…" pada dropdown topik. */
const POKOK_CUSTOM = '__pokok_custom__';

/**
 * Mode admin (default OFF) untuk memunculkan tombol AI "Saran Pokok Pembahasan"
 * — dipakai saat menyusun data kurikulum, BUKAN untuk end-user. Aktifkan via
 * localStorage: localStorage.setItem('asisten-guru:admin', '1').
 */
const ADMIN_MODE = (() => {
  try {
    return localStorage.getItem('asisten-guru:admin') === '1';
  } catch {
    return false;
  }
})();

export interface KurikulumValue {
  jenjang: string;
  kelompok: string;
  mapel: string;
  kelas: string;
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

/** Dropdown Kelas/Tingkat (nilai = "1".."12"). */
function KelasSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Field id="kelas" label="Kelas / Tingkat">
      <div className="relative">
        <select
          id="kelas"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlBase, 'cursor-pointer appearance-none pr-10')}
        >
          <option value="">— pilih kelas —</option>
          {options.map((k) => (
            <option key={k} value={k}>
              Kelas {k}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/70"
        />
      </div>
    </Field>
  );
}

/**
 * Pokok Pembahasan: dropdown bila ada data topik tetap untuk kombinasi terpilih;
 * fallback ke input teks bebas bila TIDAK ada data (graceful). Nilai yang
 * disimpan = label topik terpilih ATAU teks kustom.
 */
function PokokField({
  value,
  topik,
  onChange,
  error,
}: {
  value: string;
  topik: Topik[];
  onChange: (value: string) => void;
  error?: string;
}) {
  const labels = topik.map((t) => t.label);
  const isKnown = labels.includes(value);
  const [customChosen, setCustomChosen] = useState(value !== '' && !isKnown);

  // FALLBACK: tidak ada data topik → input teks bebas (perilaku lama).
  if (topik.length === 0) {
    return (
      <Field
        id="pokok"
        label="Pokok Pembahasan (Materi/Kitab)"
        required
        error={error}
      >
        <input
          id="pokok"
          type="text"
          value={value}
          placeholder="cth. Bab Kalam & Kalimat (Matan Al-Jurumiyah)"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'pokok-error' : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlBase, error && controlError)}
        />
      </Field>
    );
  }

  const showCustom = customChosen || (value !== '' && !isKnown);
  const selectValue = showCustom ? POKOK_CUSTOM : value;

  return (
    <Field
      id="pokok"
      label="Pokok Pembahasan (Materi/Kitab)"
      required
      error={error}
    >
      <div className="relative">
        <select
          id="pokok"
          value={selectValue}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'pokok-error' : undefined}
          onChange={(e) => {
            const v = e.target.value;
            if (v === POKOK_CUSTOM) {
              setCustomChosen(true);
              onChange('');
            } else {
              setCustomChosen(false);
              onChange(v);
            }
          }}
          className={cn(
            controlBase,
            'cursor-pointer appearance-none pr-10',
            error && controlError,
          )}
        >
          <option value="" disabled>
            — pilih pokok pembahasan —
          </option>
          {topik.map((t) => (
            <option key={t.id} value={t.label}>
              {t.label}
            </option>
          ))}
          <option value={POKOK_CUSTOM}>✏️ Tulis Kustom Pembahasan…</option>
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/70"
        />
      </div>

      <p className="mt-1 text-xs text-emerald-deep/60">
        Topik otomatis dari kurikulum — atau pilih “Tulis Kustom”.
      </p>

      {showCustom && (
        <input
          type="text"
          value={value}
          placeholder="Tulis pokok pembahasan sendiri…"
          aria-label="Pokok pembahasan kustom"
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlBase, 'mt-2', error && controlError)}
        />
      )}
    </Field>
  );
}

/**
 * Pemilih kurikulum:
 * Jenjang → Kelas/Tingkat → Kelompok Kurikulum → Mata Pelajaran → Pokok Pembahasan.
 * Pokok Pembahasan diisi dari daftar topik LOKAL (getTopik); fallback input teks.
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

  // Kelas hanya relevan untuk jenjang nasional, dan disembunyikan untuk pesantren.
  const kelasOptions = getKelasOptions(value.jenjang);
  const showKelas =
    kelasOptions.length > 0 && value.kelompok !== KELOMPOK_PESANTREN;

  const topik = getTopik(
    value.jenjang,
    value.kelompok,
    value.mapel,
    value.kelas,
  );

  return (
    <div className="rounded-2xl border border-white/40 bg-white/30 p-4 gold-edge">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-deep">
        <GraduationCap className="h-4 w-4" />
        Kurikulum
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            onChange('kelas', ''); // kelas ikut jenjang
            onChange('pokok', ''); // topik ikut kombinasi
          }}
        />

        {showKelas && (
          <KelasSelect
            value={value.kelas}
            options={kelasOptions}
            onChange={(v) => {
              onChange('kelas', v);
              onChange('pokok', ''); // topik ikut kelas
            }}
          />
        )}

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
            onChange('pokok', '');
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
          onChange={(v) => {
            onChange('mapel', v);
            onChange('pokok', ''); // topik ikut mapel
          }}
        />
      </div>

      <div className="mt-4">
        <PokokField
          // remount saat kombinasi berubah agar state custom ikut segar
          key={`pokok-${value.jenjang}-${value.kelompok}-${value.mapel}-${value.kelas}`}
          value={value.pokok}
          topik={topik}
          onChange={(v) => onChange('pokok', v)}
          error={errors?.pokok}
        />

        {/* Tombol AI hanya untuk mode admin (menyusun data), bukan end-user. */}
        {ADMIN_MODE && (
          <FieldSuggest
            label="✨ Sarankan Pokok Pembahasan"
            instruction={POKOK_INSTRUCTION}
            mode="list"
            disabled={!value.jenjang || !value.mapel}
            disabledHint="Pilih jenjang dan mata pelajaran dulu"
            context={{
              Jenjang: value.jenjang,
              'Kelompok Kurikulum': value.kelompok,
              'Mata Pelajaran': value.mapel,
              Kelas: value.kelas,
            }}
            onFill={(v) => onChange('pokok', v)}
          />
        )}
      </div>
    </div>
  );
}
