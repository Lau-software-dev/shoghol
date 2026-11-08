/** @type {import('tailwindcss').Config} */
// Tokens lifted from the design pack's compiled styles.css (Tailwind v3.4.19),
// so class names from the HTML spec carry across unchanged.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(255 255 255 / <alpha-value>)',
        ink: 'rgb(12 11 16 / <alpha-value>)',
        line: 'rgb(228 225 236 / <alpha-value>)',
        surface: 'rgb(250 249 252 / <alpha-value>)',
        muted: 'rgb(106 101 120 / <alpha-value>)',
        brand: {
          50: 'rgb(246 243 253 / <alpha-value>)',
          100: 'rgb(235 227 251 / <alpha-value>)',
          200: 'rgb(215 199 247 / <alpha-value>)',
          300: 'rgb(185 159 239 / <alpha-value>)',
          400: 'rgb(154 119 227 / <alpha-value>)', // not in the pack; interpolated
          500: 'rgb(123 79 214 / <alpha-value>)',
          600: 'rgb(101 54 190 / <alpha-value>)',
          700: 'rgb(82 43 155 / <alpha-value>)',
          800: 'rgb(66 36 124 / <alpha-value>)',
          900: 'rgb(44 24 84 / <alpha-value>)',
        },
        accent: {
          100: 'rgb(236 248 197 / <alpha-value>)',
          200: 'rgb(218 241 142 / <alpha-value>)',
          300: 'rgb(194 230 79 / <alpha-value>)',
          400: 'rgb(169 212 35 / <alpha-value>)',
          500: 'rgb(140 180 19 / <alpha-value>)',
          600: 'rgb(108 140 14 / <alpha-value>)',
          700: 'rgb(86 111 16 / <alpha-value>)', // not in the pack; interpolated
          800: 'rgb(65 83 18 / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Chivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Karla', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '.375rem',
        card: '.5rem',
      },
    },
  },
  plugins: [],
}
