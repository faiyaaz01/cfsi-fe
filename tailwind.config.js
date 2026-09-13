/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e5fd9',
          dark: '#1648a8',
          light: '#4d84e2',
          surface: '#eef4ff',
        },
        accent: {
          DEFAULT: '#ff7a29',
          hover: '#f06714',
          light: '#fff1e8',
        },
        fire: {
          red: '#e63946',
          yellow: '#f59e0b',
        },
        dark: {
          bg: '#0d1117',
          bgSecondary: '#12181f',
          surface: '#161d27',
          surfaceHover: '#1f2937',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#f2f2f2',
          textMuted: '#9ca3af',
        },
      },
      fontFamily: {
        heading: ['Raleway', 'sans-serif'],
        sans: ['Open Sans', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'glass-dark': '0 4px 20px rgba(0, 0, 0, 0.35)',
        'card-soft': '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 28px -6px rgba(30, 95, 217, 0.15)',
        'accent-glow': '0 0 20px rgba(255, 122, 41, 0.3)',
      },
      animation: {
        'marquee': 'marquee 55s linear infinite',
        'marquee-slow': 'marquee 70s linear infinite',
        'marquee-reverse': 'marquee-reverse 55s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0%, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translate3d(-50%, 0, 0)' },
          '100%': { transform: 'translate3d(0%, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
}
