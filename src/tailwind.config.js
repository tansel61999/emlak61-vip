/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ana-lacivert': '#0A192F',
        'ana-altin': '#FFD700',
      }
    },
  },
  plugins: [],
}