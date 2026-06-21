/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        dark: {
          950: '#050A18',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        emerald: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        coral: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        ice: {
          DEFAULT: '#38BDF8',
          light: '#7DD3FC',
          dark: '#0EA5E9',
        },
        slate: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
        },
      },
      fontFamily: {
        mono: ['"DIN Alternate"', '"SF Mono"', 'Menlo', 'monospace'],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
