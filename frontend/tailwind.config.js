/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lcd: {
          bg: '#1b4d3e',
          text: '#98fb98',
          glow: '#00ff7f'
        }
      },
      animation: {
        'spin-fast': 'spin 0.4s linear infinite',
        'spin-medium': 'spin 1.0s linear infinite',
        'pulse-alarm': 'pulse 0.7s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
}
