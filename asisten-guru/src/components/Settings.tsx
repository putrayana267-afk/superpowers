import { useEffect, useState } from 'react';
import { KeyRound, ExternalLink, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Key } from '@phosphor-icons/react';
import { Capacitor } from '@capacitor/core';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { useToast } from './Toast';
import { getSetting, setSetting } from '../lib/db';
import { cn } from '../lib/cn';
import { controlBase } from './controlStyles';

const KEY = 'gemini_api_key';
const AISTUDIO_URL = 'https://aistudio.google.com/app/apikey';
const NATIVE = Capacitor.isNativePlatform();

/** Halaman Pengaturan: pengguna menempelkan Gemini API key sendiri (BYOK). */
export function Settings() {
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
            <KeyRound className="h-5 w-5" />
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
                <EyeOff className="h-4 w-4" />
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
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
              <ExternalLink className="h-3.5 w-3.5" />
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
    </div>
  );
}

/** Re-export ikon untuk entri navigasi Pengaturan. */
export { Key as SettingsIcon };
