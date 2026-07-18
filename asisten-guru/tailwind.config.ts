import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Token menunjuk CSS var (didefinisikan di src/index.css). Nilai GELAP
        // identik dengan sebelumnya, jadi tampilan dark tidak berubah — yang
        // didapat adalah kemampuan re-tema lewat [data-theme].
        //
        // `rgb(var(--x) / <alpha-value>)` WAJIB agar class ber-alpha yang sudah
        // dipakai luas (text-ink/70, bg-emerald-deep/10, border-gold/60) tetap
        // jalan. Karena itu var-nya disimpan sebagai kanal RGB, bukan hex.
        emerald: {
          primary: 'rgb(var(--c-brand-fill) / <alpha-value>)',
          deep: 'rgb(var(--c-brand-text) / <alpha-value>)',
          soft: 'rgb(var(--c-surface) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--c-gold) / <alpha-value>)',
          deep: 'rgb(var(--c-gold-deep) / <alpha-value>)',
        },
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-2': 'rgb(var(--c-ink-2) / <alpha-value>)',
        // Latar dasar app (--c-bg) — utk bekas bg-[#101c13] dkk.
        base: 'rgb(var(--c-bg) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        'surface-deep': 'rgb(var(--c-surface-deep) / <alpha-value>)',
        'brand-icon': 'rgb(var(--c-brand-icon) / <alpha-value>)',
        hairline: 'rgb(var(--c-hairline) / <alpha-value>)',
        // Teks di ATAS fill terang (aturan keras §14). Menggantikan hex
        // hardcode #04140C saat komponen dimigrasi (fase berikutnya).
        'on-fill': 'rgb(var(--c-on-fill) / <alpha-value>)',
        violet: 'rgb(var(--c-violet) / <alpha-value>)',
        teal: 'rgb(var(--c-teal) / <alpha-value>)',
        // Teks aksen (role-split spt brand): dark == fill (piksel identik),
        // light dipergelap. Fill (bg-/border-/fill-) tetap pakai token polos.
        'teal-text': 'rgb(var(--c-teal-text) / <alpha-value>)',
        'violet-text': 'rgb(var(--c-violet-text) / <alpha-value>)',
        'gold-text': 'rgb(var(--c-gold-text) / <alpha-value>)',
        'gold-deep-text': 'rgb(var(--c-gold-deep-text) / <alpha-value>)',
        'chip-text': 'rgb(var(--c-chip-text) / <alpha-value>)',
        brand: {
          DEFAULT: 'rgb(var(--c-brand-fill) / <alpha-value>)',
          // hover/active = state tekan CTA; desain belum memberi padanan
          // terang → dibiarkan statis sampai fase migrasi komponen.
          hover: '#34C98C',
          active: '#0BBF68',
        },
        // Token permukaan/garis: alpha sudah menyatu di dalam var, jadi TIDAK
        // memakai <alpha-value>.
        line: 'var(--c-line)',
        sheet: 'var(--c-sheet)',
        label: 'var(--c-label)',
        glass: 'var(--c-glass)',
        side: 'var(--c-side)',
        track: 'var(--c-track)',
        'track-2': 'var(--c-track-2)',
        chip: 'var(--c-chip)',
        'control-line': 'var(--c-control-line)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        // Space Grotesk dipertahankan khusus hero (di-pin lewat font-grotesk).
        grotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      // Skala tipe token (disiplin struktural: line-height unitless, tracking
      // negatif di ukuran besar). Typeface: display Cormorant Garamond, body Manrope.
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h1: ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        h2: ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        h3: ['1.25rem', { lineHeight: '1.25', letterSpacing: '0' }],
        body: ['1.0625rem', { lineHeight: '1.5', letterSpacing: '0' }],
        caption: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        // Radius token semantik (rounded-rect ala iOS).
        button: '12px',
        input: '10px',
        card: '16px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(4, 120, 87, 0.12)',
        'glass-lg': '0 20px 60px rgba(4, 120, 87, 0.18)',
        gold: '0 0 0 1px rgba(212, 175, 55, 0.35)',
        // Elevasi token — hanya untuk overlay (popover/menu, modal/sheet).
        pop: '0 4px 12px rgba(0, 0, 0, 0.12)',
        modal: '0 12px 32px rgba(0, 0, 0, 0.16)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        shimmer: 'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
