import { useEffect, useRef } from 'react';

interface PremiumHeroProps {
  onEnter?: () => void;
}

/** '/' di web/Vercel, './' di APK Capacitor. */
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env
  .BASE_URL;

/** Tema tersimpan menentukan file desain Jill; default gelap (app boot gelap). */
function pilihTema(): 'light' | 'dark' {
  try {
    return localStorage.getItem('akhid-theme') === 'light' ? 'light' : 'dark';
  } catch {
    // Storage diblokir (mode privat / WebView ketat) — pakai default gelap.
    return 'dark';
  }
}

/**
 * Gerbang KELASENTRA — menampilkan layar auth desain Jill (file HTML mandiri di
 * `public/kelasentra-{light,dark}.html`, HARAM diubah) di dalam <iframe> penuh
 * layar. Saat guru "masuk" (toast demo berhasil), memanggil `onEnter` untuk
 * membuka aplikasi.
 *
 * Same-origin: bundel = satu origin (web & Capacitor), jadi `contentDocument`
 * bisa dibaca. Yang dilakukan HANYA dua hal, tanpa menyentuh isi file di disk:
 *   1. Melonggarkan input login SAAT RUNTIME (email jadi teks bebas, sandi tanpa
 *      minlength) agar "isi apa pun bisa masuk" untuk demo.
 *   2. Mengamati `#toast`; saat muncul dengan judul "berhasil" → `onEnter` sekali.
 * TANPA menyuntik/mengubah skrip file, TANPA postMessage. Bila contentDocument
 * tak terbaca (mis. beda origin), iframe tetap tampil apa adanya (tak crash).
 *
 * Kontrak dijaga: named export + default export `PremiumHero`, prop `onEnter`.
 */
export function PremiumHero({ onEnter }: PremiumHeroProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const enteredRef = useRef(false);
  // Tema dibaca sekali saat mount (file HTML terpisah per tema).
  const srcRef = useRef(`${BASE}kelasentra-${pilihTema()}.html`);

  // Bersihkan observer saat unmount.
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  const handleLoad = () => {
    const frame = iframeRef.current;
    if (!frame) return;

    let doc: Document | null = null;
    try {
      doc = frame.contentDocument;
    } catch {
      // Beda origin — tak bisa dibaca; tampilkan iframe apa adanya, jangan crash.
      doc = null;
    }
    if (!doc) return;

    // 1. Longgarkan HANYA input login (DOM runtime; file di disk tetap utuh).
    try {
      const email = doc.getElementById('loginEmail') as HTMLInputElement | null;
      const pass = doc.getElementById(
        'loginPassword',
      ) as HTMLInputElement | null;
      if (email) email.type = 'text';
      if (pass) pass.removeAttribute('minlength');
    } catch {
      // Abaikan; gerbang toast di bawah tetap jadi jalan masuk.
    }

    // 2. Amati #toast: saat terlihat & judul cocok "berhasil masuk" → onEnter.
    const toast = doc.getElementById('toast');
    if (!toast) return;
    const title = doc.getElementById('toastTitle');
    const observer = new MutationObserver(() => {
      if (enteredRef.current) return;
      const visible = toast.classList.contains('is-visible');
      const teks = title?.textContent ?? '';
      if (visible && /Login demo berhasil|Akun demo siap/i.test(teks)) {
        enteredRef.current = true;
        observer.disconnect();
        onEnter?.();
      }
    });
    observer.observe(toast, {
      attributes: true,
      subtree: true,
      childList: true,
      characterData: true,
    });
    observerRef.current = observer;
  };

  return (
    <div className="min-h-[100dvh] w-full bg-base">
      <iframe
        ref={iframeRef}
        title="KELASENTRA"
        src={srcRef.current}
        onLoad={handleLoad}
        className="fixed inset-0 h-full w-full"
        style={{ border: 0 }}
      />
    </div>
  );
}

export default PremiumHero;
