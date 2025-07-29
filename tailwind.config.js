/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#6a5acd', // violet
        accent2: '#38bdf8', // blue
        glass: 'rgba(30,32,60,0.8)',
        'brand-dark': '#19194d',
        'brand-grad': '#6e45e2',
        'brand-light': '#efefef',
        'accent-blue': '#50aaf2',
      },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', 'Tajawal', 'Arial', 'sans-serif'],
        header: ['DG Bebo', 'sans-serif'],
        body: ['Almarai', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
