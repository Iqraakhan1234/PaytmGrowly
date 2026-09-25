/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b1f3a',
          light: '#142f55',
          dark: '#071527',
        },
        paper: {
          DEFAULT: '#f7f5ef',
          muted: '#efece3',
        },
        ink: {
          DEFAULT: '#16223a',
          muted: '#5a6b82',
          subtle: '#8c9bae',
        },
        gold: {
          DEFAULT: '#e3982b',
          dark: '#c47e1b',
          light: '#f2b356',
        },
        teal: {
          DEFAULT: '#1b998b',
          dark: '#14766b',
          light: '#25bfaf',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      }
    },
  },
  plugins: [],
}
