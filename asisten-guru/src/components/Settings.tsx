import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  Key,
  ArrowSquareOut,
  FloppyDisk,
  Eye,
  EyeSlash,
  CircleNotch,
  Clock,
  Check,
  User,
  Camera,
  Trash,
  MoonStars,
} from '@phosphor-icons/react';
import { Capacitor } from '@capacitor/core';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { useToast } from './Toast';
import { getSetting, setSetting } from '../lib/db';
import {
  loadTheme,
  setTheme,
  TEMA_TERANG_AKTIF,
  type Theme,
} from '../lib/theme';
import {
  DEFAULT_PROFIL,
  loadProfil,
  saveProfil,
  loadFoto,
  saveFoto,
  hapusFoto,
  kompresGambar,
  inisialDari,
} from '../lib/profil';
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

  // Tema: sumber kebenarannya DOM (sudah dipasang skrip inline sebelum paint).
  // State ini hanya cermin untuk UI — inisialisasi lazy agar tak ada kedip.
  const [tema, setTemaState] = useState<Theme>(() => loadTheme());
  const gantiTema = (gelap: boolean) => {
    const next: Theme = gelap ? 'dark' : 'light';
    setTheme(next);
    setTemaState(next);
  };

  // Profil identitas — persist via lib/profil (kunci 'profil' + 'profil_foto').
  const [nama, setNama] = useState('');
  const [mapel, setMapel] = useState('');
  const [bio, setBio] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [loadingProfil, setLoadingProfil] = useState(true);
  const [savingProfil, setSavingProfil] = useState(false);

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

  // Muat profil + foto sekali. loadProfil/loadFoto tak pernah throw (aman).
  useEffect(() => {
    let active = true;
    loadProfil()
      .then((p) => {
        if (!active) return;
        setNama(p.nama);
        setMapel(p.mapel);
        setBio(p.bio);
      })
      .finally(() => active && setLoadingProfil(false));
    loadFoto()
      .then((f) => active && setFoto(f))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function saveProfilForm() {
    setSavingProfil(true);
    try {
      await saveProfil({
        nama: nama.trim(),
        mapel: mapel.trim(),
        bio: bio.trim(),
      });
      toast('Profil tersimpan.', 'success');
    } catch {
      toast('Gagal menyimpan profil. Coba lagi.', 'error');
    } finally {
      setSavingProfil(false);
    }
  }

  // Pilih foto → kompres di klien (canvas, sisi maks 384px, JPEG 0.7) →
  // simpan ke 'profil_foto'. Reset input agar file yang sama bisa dipilih lagi.
  async function pilihFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await kompresGambar(file);
      await saveFoto(dataUrl);
      setFoto(dataUrl);
      toast('Foto profil tersimpan.', 'success');
    } catch {
      toast('Gagal memproses foto. Coba gambar lain.', 'error');
    }
  }

  async function hapusFotoProfil() {
    try {
      await hapusFoto();
      setFoto(null);
      toast('Foto dihapus.', 'success');
    } catch {
      toast('Gagal menghapus foto.', 'error');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Disembunyikan sampai komponen selesai dimigrasi ke token (sebagian
          masih hex hardcode → tema terang belum rapi). Kode sengaja DIPERTAHANKAN;
          buka kembali cukup dgn TEMA_TERANG_AKTIF = true di lib/theme.ts. */}
      {TEMA_TERANG_AKTIF && (
        <GlassCard animate>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
              <MoonStars className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-emerald-deep">
                Tampilan
              </h2>
              <p className="text-xs text-ink/60">
                Pilihan disimpan di perangkat dan langsung dipakai saat app
                dibuka lagi.
              </p>
            </div>
          </div>

          <Toggle
            id="tema-gelap"
            checked={tema === 'dark'}
            onChange={gantiTema}
            label="Mode gelap"
            hint={
              tema === 'dark'
                ? 'Aktif — tampilan gelap (bawaan).'
                : 'Nonaktif — tampilan terang.'
            }
          />
        </GlassCard>
      )}

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
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-deep gold-edge">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-emerald-deep">
              Profil
            </h2>
            <p className="text-xs text-ink/60">
              Nama, mata pelajaran, bio, &amp; foto — tampil pada sapaan
              pembuka. Tersimpan di perangkat ini.
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4">
          {foto ? (
            <img
              src={foto}
              alt=""
              className="h-16 w-16 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand to-violet font-grotesk text-xl font-bold text-on-fill">
              {inisialDari(nama || DEFAULT_PROFIL.nama)}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-ink/80 transition-opacity hover:opacity-80 active:opacity-70">
              <Camera className="h-4 w-4" />
              {foto ? 'Ganti foto' : 'Unggah foto'}
              <input
                type="file"
                accept="image/*"
                onChange={pilihFoto}
                className="hidden"
              />
            </label>
            {foto && (
              <button
                type="button"
                onClick={hapusFotoProfil}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-ink/60 transition-opacity hover:opacity-80 active:opacity-70"
              >
                <Trash className="h-4 w-4" />
                Hapus
              </button>
            )}
          </div>
        </div>

        <label
          htmlFor="profil-nama"
          className="text-sm font-medium text-ink/80"
        >
          Nama
        </label>
        <input
          id="profil-nama"
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder={loadingProfil ? 'Memuat…' : DEFAULT_PROFIL.nama}
          disabled={loadingProfil}
          className={cn(controlBase, 'mt-1.5')}
        />

        <label
          htmlFor="profil-mapel"
          className="mt-3 block text-sm font-medium text-ink/80"
        >
          Mata pelajaran
        </label>
        <input
          id="profil-mapel"
          type="text"
          value={mapel}
          onChange={(e) => setMapel(e.target.value)}
          placeholder={loadingProfil ? 'Memuat…' : DEFAULT_PROFIL.mapel}
          disabled={loadingProfil}
          className={cn(controlBase, 'mt-1.5')}
        />

        <label
          htmlFor="profil-bio"
          className="mt-3 block text-sm font-medium text-ink/80"
        >
          Bio <span className="text-ink/40">(opsional)</span>
        </label>
        <textarea
          id="profil-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="mis. Guru Bahasa Arab MTs, gemar metode bermain peran."
          disabled={loadingProfil}
          className={cn(controlBase, 'mt-1.5 resize-y')}
        />

        <div className="mt-3">
          <Button
            onClick={saveProfilForm}
            disabled={savingProfil || loadingProfil}
            icon={
              savingProfil ? (
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
              ? 'bg-brand text-on-fill'
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
            <p className="px-2 py-2 text-xs text-gold-text">
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
            <h3 className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-label">
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
                <h3 className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-label">
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
