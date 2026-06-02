/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        secondary: '#2563eb',
        accent: '#f59e0b',
        surface: '#ffffff',
        muted: '#64748b',
        ink: '#0f172a',
      },
    },
  },
  plugins: [],
};
