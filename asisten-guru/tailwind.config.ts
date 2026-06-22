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
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(4, 120, 87, 0.12)',
        'glass-lg': '0 20px 60px rgba(4, 120, 87, 0.18)',
        gold: '0 0 0 1px rgba(212, 175, 55, 0.35)',
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
