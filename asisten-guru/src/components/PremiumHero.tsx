/**
 * PremiumHero — landing sinematik tema TERANG, tipografi serif besar, teks
 * tengah dengan fade-rise. Latar (bawah) saat ini PLACEHOLDER CSS; video buku
 * disusulkan saat asetnya tersedia (lihat SWAP POINT di bawah).
 *
 * Kontrak integrasi (dipakai src/main.tsx): export bernama `PremiumHero` +
 * default, prop opsional `onEnter` (dipanggil saat masuk aplikasi).
 */

interface PremiumHeroProps {
  onEnter?: () => void;
}

export function PremiumHero({ onEnter }: PremiumHeroProps) {
  const enter =
    onEnter ??
    (() => {
      window.location.hash = '';
      window.location.reload();
    });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* MEDIA PLACEHOLDER (z-0) — TITIK SWAP */}
      {/* SWAP POINT: ganti blok placeholder ini dengan <video poster webm/mp4> + fallback 4G saat aset di public/hero/ sudah ada */}
      <div
        className="absolute inset-x-0 bottom-0 top-[45%] z-0 flex items-end justify-center pb-10 sm:top-[38%]"
        style={{
          background:
            'linear-gradient(150deg, #E9EFF4 0%, #EDEBF3 50%, #F4E9E2 100%)',
        }}
      >
        <span className="text-xs uppercase tracking-[0.2em] text-[#9aa7b1]">
          video buku — menyusul
        </span>
      </div>

      {/* Overlay: di atas placeholder, di bawah konten — agar teks serif kebaca */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white via-transparent to-white" />

      {/* Navbar */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <span className="font-serif text-3xl tracking-tight text-black">
          Asisten Mengajar
        </span>
        <div className="hidden items-center gap-6 text-sm md:flex">
          <span className="text-black">Beranda</span>
          <span className="text-[#6F6F6F]">Fitur</span>
          <span className="text-[#6F6F6F]">Cara Kerja</span>
        </div>
        <button
          type="button"
          onClick={enter}
          className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          Masuk Aplikasi
        </button>
      </nav>

      {/* Hero */}
      <div
        className="relative z-10 flex flex-col items-center px-6 pb-40 text-center"
        style={{ paddingTop: 'calc(8rem - 75px)' }}
      >
        <h1 className="max-w-5xl animate-fade-rise font-serif text-5xl leading-[0.95] tracking-[-0.02em] text-black motion-reduce:animate-none sm:text-7xl md:text-8xl">
          Modul Ajar siap pakai,{' '}
          <i style={{ color: '#6F6F6F' }}>dalam menit.</i>
        </h1>
        <p className="mt-8 max-w-2xl animate-fade-rise-delay text-base leading-relaxed text-[#6F6F6F] motion-reduce:animate-none sm:text-lg">
          Asisten Mengajar menyusun Modul Ajar, LKPD, Bank Soal, dan rubrik dari
          Capaian Pembelajaran resmi Kurikulum Merdeka — kamu tinggal sesuaikan
          dengan kelasmu.
        </p>
        <button
          type="button"
          onClick={enter}
          className="mt-12 animate-fade-rise-delay-2 rounded-full bg-black px-14 py-5 text-base font-semibold text-white transition-transform hover:scale-[1.03] motion-reduce:animate-none"
        >
          Masuk Aplikasi
        </button>
      </div>
    </div>
  );
}

export default PremiumHero;
