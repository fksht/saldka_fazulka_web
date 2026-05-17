/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fffaf5',
          100: '#f8efe4',
          200: '#efddcb',
          300: '#e3c8b2',
          400: '#d6b194',
        },
        cocoa: {
          400: '#9b7a68',
          500: '#7f6253',
          600: '#684c41',
          700: '#563c34',
          800: '#442e28',
          900: '#30201c',
          950: '#1f1411',
        },
        rose: {
          50: '#fff1f4',
          100: '#ffe1e8',
          200: '#ffc6d3',
          300: '#f8a6b9',
          400: '#eb7f9d',
          500: '#d95f84',
          600: '#be456e',
          700: '#9e3458',
          800: '#812c49',
        },
        sage: {
          50: '#edf7f0',
          100: '#d9ecdd',
          600: '#5d8d6b',
          700: '#477155',
        },
        bakery: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a38a80',
          600: '#8b6f65',
          700: '#6d554c',
          800: '#523d36',
          900: '#3a2b25',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
