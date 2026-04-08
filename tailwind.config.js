/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'meraki-main': '#1a1a1a', // Un negro elegante para Meraki
        'meraki-gold': '#D4AF37', // Dorado para los botones
      }
    },
  },
  plugins: [],
}