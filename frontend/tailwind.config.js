/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#001030',
        gold: '#d0a040',
        lightBg: '#F5F7FA',
      },
    },
  },
  plugins: [],
}
