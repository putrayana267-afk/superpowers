import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palet noir (tema gelap tunggal, hard-swap). ink dibalik jadi TERANG
        // (dipakai sbg teks); emerald.soft dibalik jadi surface GELAP.
        emerald: {
          primary: '#4CE896',
          deep: '#8EFFCA',
          soft: '#04331D',
        },
        gold: {
          DEFAULT: '#FFC24D',
          deep: '#F0A52A',
        },
        ink: '#EAFFF4',
        // Aksen ekstra noir — dipakai fase komponen berikutnya.
        violet: '#9B8CFF',
        teal: '#34E7E0',
        // Token brand (fill CTA) — noir: hijau terang; hover/active lebih dalam
        // (pola "pressed-darker" dipertahankan).
        brand: {
          DEFAULT: '#4CE896',
          hover: '#34C98C',
          active: '#0BBF68',
        },
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
