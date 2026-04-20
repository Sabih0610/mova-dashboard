/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0D2B52', light: '#1B4B82', dark: '#071929' },
        'blue-mova': { DEFAULT: '#2563EB', light: '#3B82F6', pale: '#DBEAFE' },
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        orange: '#F97316',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

