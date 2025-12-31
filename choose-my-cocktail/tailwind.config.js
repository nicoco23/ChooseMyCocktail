/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fredoka', 'sans-serif'],
        display: ['Fredoka', 'cursive'],
      },
      colors: {
        food: {
          dark: '#2b1821ff',
          orange: '#EA8C55',
          yellow: '#E5DD76',
          purple: '#A17BB7',
        },
        hk: {
          yellow: '#FFE135',
          blue: {
            dark: '#0079D3',
            light: '#82CFFD',
          },
          pink: {
            light: '#FFB7C5',
            pale: '#FFF0F5',
            hot: '#FF69B4',
          },
          red: {
            dark: '#C2185B',
            light: '#FF1493',
            bow: '#FF0000',
          }
        }
      }
    },
  },
  plugins: [],
}

