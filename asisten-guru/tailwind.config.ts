import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          primary: '#10B981',
          deep: '#047857',
          soft: '#ECFDF5',
        },
        gold: {
          DEFAULT: '#D4AF37',
          deep: '#B8860B',
        },
        ink: '#0B1F17',
        // Token brand (hijau asli #047857, hue OKLCH ~165 dipertahankan). Resting =
        // hex persis agar identik dgn warna sekarang; hover/active diturunkan L-nya
        // (disiplin "pressed-darker" ala iOS), hue & chroma tetap.
        brand: {
          DEFAULT: '#047857', // = oklch(0.508 0.105 165.6), kontras putih 5.48:1
          hover: 'oklch(0.468 0.105 165.6)', // -0.04 L
          active: 'oklch(0.428 0.105 165.6)', // -0.08 L
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      // Skala tipe token (disiplin struktural: line-height unitless, tracking
      // negatif di ukuran besar). Typeface tetap Inter/Plus Jakarta Sans.
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
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        shimmer: 'shimmer 1.5s linear infinite',
        'fade-rise': 'fade-rise 0.8s ease-out both',
        'fade-rise-delay': 'fade-rise 0.8s ease-out 0.2s both',
        'fade-rise-delay-2': 'fade-rise 0.8s ease-out 0.4s both',
      },
    },
  },
  plugins: [],
} satisfies Config;
