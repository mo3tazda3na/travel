/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c'
        }
      }
    }
  },
  plugins: []
};
