/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#022c22',
          900: '#064e3b',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
        },
        mint: {
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
          100: '#d1fae5',
          50: '#ecfdf5',
        },
        canvas: {
          DEFAULT: '#f7faf8',
          subtle: '#f1f5f3',
          border: '#e2e8f0',
        },
        brand: {
          navy: '#064E3B',
          DEFAULT: '#047857',
          light: '#34D399',
          lighter: '#6EE7B7',
          bg: '#ECFDF5',
        },
        partial: {
          DEFAULT: '#EF9F27',
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#92400E',
        },
        danger: {
          DEFAULT: '#E24B4A',
          bg: '#FEF2F2',
          border: '#FCA5A5',
          text: '#991B1B',
        },
        insight: {
          DEFAULT: '#7F77DD',
          bg: '#F5F3FF',
          text: '#5B21B6',
        },
        neutralCustom: {
          DEFAULT: '#64748B',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(6, 78, 59, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        panel: '0 10px 30px -5px rgba(6, 78, 59, 0.08)',
      }
    },
  },
  plugins: [],
}
