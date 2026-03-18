/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#FDF8EE',
          100: '#FAF0D4',
          200: '#F0D998',
          300: '#E4C26A',
          400: '#D4A843',
          500: '#B8901E',
          600: '#8A6A0A',
        },
      },
      animation: {
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

