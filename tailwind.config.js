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
        dark: {
          50: '#f7f7f8',
          100: '#eeeef1',
          200: '#d5d5db',
          300: '#b0b1bb',
          400: '#8b8c9b',
          500: '#6b6c7d',
          600: '#555666',
          700: '#444553',
          800: '#383944',
          900: '#313239',
          950: '#27282e',
        },
      },
    },
  },
  plugins: [],
}