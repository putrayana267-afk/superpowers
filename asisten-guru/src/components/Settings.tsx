import { useEffect, useRef, useState } from 'react';
import {
  Key,
  ArrowSquareOut,
  FloppyDisk,
  Eye,
  EyeSlash,
  CircleNotch,
  Clock,
  Check,
} from '@phosphor-icons/react';
import { Capacitor } from '@capacitor/core';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { useToast } from './Toast';
import { getSetting, setSetting } from '../lib/db';
import { cn } from '../lib/cn';
import { controlBase } from './controlStyles';
import { KOTA } from '../features/waktu/kota';
import type { Zona } from '../features/waktu/kota';
import { useZonaWaktu } from '../features/waktu/useZonaWaktu';
import type { PilihanZona } from '../features/waktu/useZonaWaktu';
import { muatKecamatan, cariKecamatan } from '../features/waktu/kecamatan';
import type { Kecamatan } from '../features/waktu/kecamatan';

const KEY = 'gemini_api_key';
const ZONA_URUT: Zona[] = ['WIB', 'WITA', 'WIT'];
const AISTUDIO_URL = 'https://aistudio.google.com/app/apikey';
const NATIVE = Capacitor.isNativePlatform();

/** Halaman Pengaturan: pengguna menempelkan Gemini API key sendiri (BYOK). */
export function Settings() {
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Zona Waktu & Kota — persist via useZonaWaktu ('am.zonaWaktu').
  const { pilihan, setPilihan } = useZonaWaktu();
  const [cari, setCari] = useState('');
  const refZona = useRef<HTMLDivElement>(null);

  // Kandidat kota (menunggu konfirmasi centang) + buka/tutup daftar.
  const [kandidat, setKandidat] = useState<{
    p: PilihanZona;
    label: string;
  } | null>(null);
  const [daftarTerbuka, setDaftarTerbuka] = useState(true);

  // Umpan balik seragam: simpan, reset pencarian, tutup daftar, toast,
  // lalu meluncur ke header "Aktif" agar konfirmasi terlihat.
  const pilihKota = (p: PilihanZona, labelToast: string) => {
    setPilihan(p);
    setCari('');
    setDaftarTerbuka(false);
    toast(`Zona waktu: ${labelToast} ✓`, 'success');
    refZona.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const kotaCocok = KOTA.filter((k) =>
    k.nama.toLowerCase().includes(cari.trim().toLowerCase()),
  );

  // Dataset kecamatan se-Indonesia (lazy; dimuat saat ketikan >= 2 huruf).
  const [kecamatan, setKecamatan] = useState<Kecamatan[] | null>(null);
  const [muatKec, setMuatKec] = useState<'idle' | 'memuat' | 'gagal'>('idle');
  const modeCari = cari.trim().length >= 2;

  useEffect(() => {
    if (!modeCari || kecamatan || muatKec !== 'idle') return;
    setMuatKec('memuat');
    muatKecamatan()
      .then((d) => {
        setKecamatan(d);
        setMuatKec('idle');
      })
      .catch(() => setMuatKec('gagal'));
  }, [modeCari, kecamatan, muatKec]);

  const hasilKecamatan =
    modeCari && kecamatan ? cariKecamatan(kecamatan, cari).slice(0, 50) : null;

  useEffect(() => {
    let active = true;
    getSetting(KEY)
      .then((v) => {
        if (active) {
          setValue(v ?? '');
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    try {
      await setSetting(KEY, value.trim());
      toast('API key tersimpan di perangkat.', 'success');
    } catch {
      toast('Gagal menyimpan. Coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassCard gold animate>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
            <Key className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-emerald-deep">
              Gemini API Key
            </h2>
            <p className="text-xs text-ink/60">
              {NATIVE
                ? 'Tersimpan hanya di perangkat Anda. Dipakai untuk membuat materi saat online.'
                : 'Opsional. Diisi → materi dibuat memakai kunci Anda; dikosongkan → memakai server kami.'}
            </p>
          </div>
        </div>

        <label htmlFor="gemini-key" className="text-sm font-medium text-ink/80">
          Tempel API key di sini
        </label>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <input
              id="gemini-key"
              type={show ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={loading ? 'Memuat…' : 'AIza…'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={loading}
              className={cn(controlBase, 'pr-10 font-mono')}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Sembunyikan' : 'Tampilkan'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink/40 hover:text-ink/70"
            >
              {show ? (
                <EyeSlash className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button
            onClick={save}
            disabled={saving || loading}
            icon={
              saving ? (
                <CircleNotch className="h-4 w-4 animate-spin" />
              ) : (
                <FloppyDisk className="h-4 w-4" />
              )
            }
          >
            Simpan
          </Button>
        </div>
      </GlassCard>

      <GlassCard animate>
        <h3 className="mb-3 font-display text-base font-bold text-emerald-deep">
          Cara mendapatkan API key (gratis)
        </h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink/70">
          <li>
            Buka{' '}
            <a
              href={AISTUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-deep underline"
            >
              Google AI Studio
              <ArrowSquareOut className="h-3.5 w-3.5" />
            </a>{' '}
            dan masuk dengan akun Google.
          </li>
          <li>Klik “Create API key”, lalu salin kunci yang muncul.</li>
          <li>Tempel di kolom di atas, lalu tekan Simpan.</li>
        </ol>
        <p className="mt-3 text-xs text-ink/50">
          {NATIVE
            ? 'Kunci hanya disimpan di perangkat (SQLite), tidak dikirim ke server mana pun selain Google saat membuat materi.'
            : 'Kunci opsional, disimpan di perangkat ini. Bila diisi, materi dibuat memakai kunci Anda; bila kosong, memakai kunci server kami.'}
        </p>
      </GlassCard>

      <GlassCard animate>
        <div ref={refZona} className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-emerald-deep">
              Zona Waktu &amp; Kota
            </h2>
            <p className="text-xs text-ink/60">
              Jam dan sapaan mengikuti zona ini.{' '}
              <span className="font-semibold text-emerald-deep">
                Aktif:{' '}
                {pilihan.mode === 'auto'
                  ? 'Otomatis (ikut perangkat)'
                  : `${pilihan.nama} (${pilihan.zona})`}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPilihan({ mode: 'auto' })}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
            pilihan.mode === 'auto'
              ? 'bg-brand text-[#04140C]'
              : 'bg-white/5 text-emerald-deep hover:bg-white/10',
          )}
        >
          Otomatis (ikut perangkat)
        </button>

        <div className="relative mt-3">
          <input
            type="text"
            value={kandidat ? kandidat.label : cari}
            onChange={(e) => {
              setKandidat(null);
              setCari(e.target.value);
              setDaftarTerbuka(true);
            }}
            onFocus={() => setDaftarTerbuka(true)}
            placeholder="Cari kota…"
            aria-label="Cari kota"
            className={cn(controlBase, kandidat && 'pr-12')}
          />
          {kandidat && (
            <button
              type="button"
              onClick={() => {
                pilihKota(kandidat.p, kandidat.label);
                setKandidat(null);
              }}
              aria-label="Terapkan kota"
              className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-emerald-primary hover:bg-white/10"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
        </div>

        {daftarTerbuka && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
          {modeCari && muatKec === 'memuat' && (
            <p className="flex items-center gap-2 px-2 py-3 text-xs text-ink/50">
              <CircleNotch className="h-3.5 w-3.5 animate-spin" />
              Memuat daftar kecamatan…
            </p>
          )}
          {modeCari && muatKec === 'gagal' && (
            <p className="px-2 py-2 text-xs text-gold">
              Daftar kecamatan gagal dimuat — pakai daftar populer di bawah.
            </p>
          )}
          {hasilKecamatan &&
            (hasilKecamatan.length === 0 ? (
              <p className="px-2 py-3 text-xs text-ink/50">
                Tidak ada kecamatan yang cocok.
              </p>
            ) : (
              hasilKecamatan.map((e, i) => {
                const aktif = pilihan.mode === 'kota' && pilihan.nama === e.n;
                const isKandidat =
                  kandidat !== null &&
                  kandidat.p.mode !== 'auto' &&
                  kandidat.p.nama === e.n &&
                  kandidat.p.zona === e.z;
                return (
                  <button
                    key={`${e.n}|${e.k}|${i}`}
                    type="button"
                    onClick={() =>
                      setKandidat({
                        p: { mode: 'kota', nama: e.n, zona: e.z },
                        label: `${e.n} (${e.z})`,
                      })
                    }
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      aktif || isKandidat
                        ? 'bg-white/10 font-semibold text-emerald-deep'
                        : 'text-ink/80 hover:bg-white/10',
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {e.n} <span className="text-ink/50">— {e.k}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-emerald-deep">
                      {e.z}
                    </span>
                  </button>
                );
              })
            ))}
          {!hasilKecamatan && muatKec !== 'memuat' && (
            <h3 className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
              Populer
            </h3>
          )}
          {!hasilKecamatan && muatKec !== 'memuat' && kotaCocok.length === 0 && (
            <p className="px-2 py-3 text-xs text-ink/50">
              Tidak ada kota yang cocok.
            </p>
          )}
          {hasilKecamatan || muatKec === 'memuat'
            ? null
            : ZONA_URUT.map((zona) => {
            const daftar = kotaCocok.filter((k) => k.zona === zona);
            if (daftar.length === 0) return null;
            return (
              <div key={zona}>
                <h3 className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
                  {zona}
                </h3>
                {daftar.map((k) => {
                  const aktif =
                    pilihan.mode === 'kota' && pilihan.nama === k.nama;
                  const isKandidat =
                    kandidat !== null &&
                    kandidat.p.mode !== 'auto' &&
                    kandidat.p.nama === k.nama &&
                    kandidat.p.zona === k.zona;
                  return (
                    <button
                      key={k.nama}
                      type="button"
                      onClick={() =>
                        setKandidat({
                          p: { mode: 'kota', nama: k.nama, zona: k.zona },
                          label: `${k.nama} (${k.zona})`,
                        })
                      }
                      className={cn(
                        'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        aktif || isKandidat
                          ? 'bg-white/10 font-semibold text-emerald-deep'
                          : 'text-ink/80 hover:bg-white/10',
                      )}
                    >
                      {k.nama}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        )}

      </GlassCard>
    </div>
  );
}

/** Re-export ikon untuk entri navigasi Pengaturan. */
export { Key as SettingsIcon };
