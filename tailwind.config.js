/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#F5F3EE',
        'bg-strong': '#EDE8DE',
        border: '#E0D8C8',
        'btn-dark': '#2A2018',
      },
    },
  },
  plugins: [],
};
