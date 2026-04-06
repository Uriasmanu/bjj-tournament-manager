import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {

        sans: ["var(--font-inter)", "sans-serif"],

        display: ["var(--font-barlow)", "sans-serif"],
      },
      colors: {
        'bjj-gold': '#FFD700',
        'bjj-gold-dark': '#DAA520',
        'bjj-blue': '#1E3A8A',
        'bjj-blue-light': '#3B82F6',
        'bjj-white': '#FFFFFF',
        'bjj-black': '#111111',
        'bjj-gray': '#2A2A2A',
      },
    },
  },
};
export default config;