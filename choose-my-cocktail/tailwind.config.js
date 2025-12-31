/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        food: {
          dark: '#2b1821ff',
          orange: '#EA8C55',
          yellow: '#E5DD76',
          purple: '#A17BB7',
        },
        hk: {
          yellow: '#E6D18C',
          green: {
            dark: '#798E61',
            light: '#9FB279',
          },
          pink: {
            light: '#D7ACA7',
            pale: '#E6D2D0',
          },
          red: {
            dark: '#A13C36',
            light: '#C1645B',
          }
        }
      }
    },
  },
  plugins: [],
}

