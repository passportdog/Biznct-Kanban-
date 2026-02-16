/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2F6EDB',
          blueDark: '#1E4F91',
          green: '#6DBE45',
          greenLight: '#9EDB66',
        },
        dark: {
          bg: '#0F172A',
          surface: '#111827',
          surfaceSecondary: '#1F2937',
          border: '#2D3748',
          textPrimary: '#F1F5F9',
          textSecondary: '#CBD5E1',
        },
        light: {
          bg: '#F5F7FA',
          surface: '#FFFFFF',
          surfaceSecondary: '#EEF2F7',
          border: '#E2E8F0',
          textPrimary: '#0F172A',
          textSecondary: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}