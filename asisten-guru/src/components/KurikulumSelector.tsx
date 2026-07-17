import { useState } from 'react';
import { CaretDown, GraduationCap } from '@phosphor-icons/react';
import {
  JENJANG_NAMES,
  KELOMPOK_NAMES,
  KELOMPOK_PESANTREN,
  getMapelGroups,
  getKelasOptions,
} from '../data/struktur';
import type { MapelGroup } from '../data/struktur';
import { getTopik, getEntri } from '../data/kurikulum';
import type { Topik, StatusData } from '../data/kurikulum';
import { Field } from './Field';
import { FieldSuggest } from './FieldSuggest';
import { SheetSelect } from './SheetSelect';
import { cn } from '../lib/cn';
import { controlBase, controlError } from './controlStyles';

const POKOK_INSTRUCTION =
  'Berikan 6-8 topik/bab pembelajaran yang RELEVAN dan runtut untuk konteks di atas ' +
  '(jenjang, kelompok kurikulum, mata pelajaran). Untuk Kekhasan Pesantren, sebutkan ' +
  'bab/kitab yang lazim dipelajari. Jawab HANYA daftar, satu topik per baris, tanpa nomor, ' +
  'tanpa penjelasan tambahan.';

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


/**
 * Pokok Pembahasan: dropdown bila ada data topik tetap untuk kombinasi terpilih;
 * fallback ke input teks bebas bila TIDAK ada data (graceful). Nilai yang
 * disimpan = label topik terpilih ATAU teks kustom.
 */
function PokokField({
  value,
  topik,
  status,
  sumber,
  onChange,
  error,
}: {
  value: string;
  topik: Topik[];
  status: StatusData | null;
  sumber?: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const labels = topik.map((t) => t.label);
  const isKnown = labels.includes(value);
  // Mode manual sebagai sumber kebenaran tunggal (nilai tidak hilang saat ganti).
  const [manual, setManual] = useState(value !== '' && !isKnown);

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

  const isDraft = status === 'draft';
  const isContoh = status === 'contoh';
  const showBadge = isDraft || isContoh;
  const selectValue = isKnown ? value : '';

  return (
    <Field
      id="pokok"
      label="Pokok Pembahasan (Materi/Kitab)"
      required
      error={error}
    >
      {showBadge && (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-gold bg-gold px-1.5 py-0.5 text-[11px] font-semibold text-on-fill">
            ⚠ {isContoh ? 'Contoh' : 'Draft'}
          </span>
          <span className="min-w-0 text-xs text-gold-text">
            {isContoh
              ? 'Contoh — bukan data resmi.'
              : 'Data belum diverifikasi, mohon dicek.'}
          </span>
        </div>
      )}

      {manual ? (
        <>
          <input
            type="text"
            value={value}
            placeholder="Tulis pokok pembahasan sendiri…"
            aria-label="Pokok pembahasan kustom"
            onChange={(e) => onChange(e.target.value)}
            className={cn(controlBase, error && controlError)}
          />
          <button
            type="button"
            onClick={() => setManual(false)}
            className="mt-1 w-fit text-xs font-medium text-emerald-deep hover:underline"
          >
            ← pilih dari daftar
          </button>
        </>
      ) : (
        <>
          <div className="relative">
            <select
              id="pokok"
              value={selectValue}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'pokok-error' : undefined}
              onChange={(e) => {
                const v = e.target.value;
                if (v === POKOK_CUSTOM) {
                  setManual(true); // tetap simpan value lama agar bisa diedit
                } else {
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
              <option value={POKOK_CUSTOM}>✏️ Ketik manual / lainnya…</option>
            </select>
            <CaretDown
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/70"
            />
          </div>

          <p className="mt-1 text-xs text-label">
            Topik otomatis dari kurikulum — atau pilih “Ketik manual”.
          </p>
        </>
      )}

      {status === 'verified' && sumber && (
        <p className="mt-1 text-xs text-ink/45">Sumber: {sumber}</p>
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
  const entri = getEntri(
    value.jenjang,
    value.kelompok,
    value.mapel,
    value.kelas,
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] gold-edge">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-deep">
        <GraduationCap className="h-4 w-4" />
        Kurikulum
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SheetSelect
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
          <SheetSelect
            id="kelas"
            label="Kelas / Tingkat"
            value={value.kelas}
            groups={[{ label: 'Kelas', mapel: kelasOptions }]}
            labelPrefix="Kelas "
            allowManual={false}
            required={false}
            placeholder="— pilih kelas —"
            onChange={(v) => {
              onChange('kelas', v); // value tetap "1".."6", BUKAN "Kelas 3"
              onChange('pokok', ''); // topik ikut kelas
            }}
          />
        )}

        <SheetSelect
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

        <SheetSelect
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
          status={entri?.status ?? null}
          sumber={entri?.sumber}
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
