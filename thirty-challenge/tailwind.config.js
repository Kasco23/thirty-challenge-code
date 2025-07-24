/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#6a5acd',      // violet
        accent2: '#38bdf8',     // blue
        glass: 'rgba(30,32,60,0.8)',
      },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', 'Tajawal', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
