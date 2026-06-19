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
        navy: {
          50: '#f0f3f9',
          100: '#dce4f0',
          200: '#b5c5e0',
          300: '#869fc9',
          400: '#5776b0',
          500: '#365691',
          600: '#2a4474',
          700: '#22365c',
          800: '#1a2744',
          900: '#121a2e',
          950: '#0a0f1c',
        },
        champagne: {
          50: '#faf7ee',
          100: '#f3ecd6',
          200: '#e6d7ad',
          300: '#d9bf7d',
          400: '#c9a962',
          500: '#b89149',
          600: '#9f763c',
          700: '#845c33',
          800: '#6c4b2e',
          900: '#593f29',
        },
        sentiment: {
          positive: '#2d9a5e',
          negative: '#d94c4c',
          neutral: '#6b7280',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'SimSun', 'serif'],
        sans: ['"Inter"', '"Noto Sans SC"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'glow': '0 0 20px rgba(201,169,98,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
