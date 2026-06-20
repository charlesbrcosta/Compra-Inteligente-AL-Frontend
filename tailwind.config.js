/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#D62839',
        secondary: '#2563A8',
        accent: '#F2A93B',
        success: '#2F8F5B',
        sand: '#FFF8EE',
        line: '#F0DFC9',
        surface: '#ffffff',
        muted: '#8A736A',
        ink: '#2B1B16',
      },
    },
  },
  plugins: [],
};
