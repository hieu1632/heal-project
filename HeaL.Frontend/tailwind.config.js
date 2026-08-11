/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5E3C',
        secondary: '#F5E6D3',
        accent: '#D4A574',
      },
    },
  },
  plugins: [],
}