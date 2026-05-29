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
          100: '#fbf3e8',
          200: '#f3e3cf',
          300: '#e7cdaf',
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
          50: '#fff4f6',
          100: '#ffe1e8',
          200: '#fdc8d4',
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
        gold: {
          100: '#f6ead0',
          200: '#ecd6a8',
          300: '#dfba76',
          400: '#cca155',
          500: '#b88a44',
          600: '#956d34',
          700: '#71522a',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Caveat"', '"Cormorant Garamond"', 'cursive'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'rose-wash':
          'radial-gradient(circle at top left, rgba(248, 166, 185, 0.32), transparent 55%), radial-gradient(circle at bottom right, rgba(248, 166, 185, 0.22), transparent 55%)',
      },
    },
  },
  plugins: [],
}
