/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#41431B',
        secondary: '#AEB784',
        background: '#E3DBBB',
        card: '#F8F3E1',
      }
    },
  },
  plugins: [],
}
