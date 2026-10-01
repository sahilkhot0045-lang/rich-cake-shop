/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF5EE',
          200: '#F3E9DD',
          300: '#EBDCCB',
          400: '#DCC3A7',
        },
        blush: {
          50: '#FEF8F6',
          100: '#FCEEE9',
          200: '#F8D8CF',
          300: '#F2BCB0',
          400: '#E89A8F',
          500: '#D67B70',
        },
        chocolate: {
          100: '#EFEBE9',
          200: '#D7CCC8',
          400: '#8D6E63',
          600: '#5D4037',
          700: '#4E342E',
          800: '#3E2723',
          900: '#23120B',
          950: '#140A06',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F9F3DC',
          200: '#F1E2AE',
          300: '#E8D080',
          400: '#DEBE53',
          500: '#D4AF37', // Master Champagne Gold
          600: '#B8860B',
          700: '#996515',
          800: '#7A5210',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(44, 24, 16, 0.06)',
        card: '0 8px 30px -4px rgba(44, 24, 16, 0.08)',
        gold: '0 6px 20px -2px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
};
