// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bjj-gold': '#FFD700',
        'bjj-gold-dark': '#DAA520',
        'bjj-blue': '#1E3A8A',
        'bjj-blue-light': '#3B82F6',
        'bjj-white': '#FFFFFF',
        'bjj-black': '#111111',
        'bjj-gray': '#2A2A2A',
      },
      backgroundColor: {
        'white': '#FFFFFF',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}