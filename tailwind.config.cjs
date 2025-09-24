/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cycle-dark': '#1a1a1a',
        'cycle-darker': '#0f0f0f',
        'intensity-low': '#22c55e',
        'intensity-medium': '#f59e0b',
        'intensity-high': '#ef4444',
        'intensity-rest': '#3b82f6',
      },
      fontSize: {
        'timer': ['6rem', { lineHeight: '1' }],
        'timer-sm': ['4rem', { lineHeight: '1' }],
      },
      animation: {
        'flash': 'flash 0.5s ease-in-out',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
}