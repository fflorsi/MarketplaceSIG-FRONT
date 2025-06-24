/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#da2c38',
        'secondary': '#226f54',
        'accent': '#87c38f',
        'light': '#f4f0bb',
        'dark': '#43291f',
        'primary-hover': '#c02530',
        'secondary-hover': '#1d5d47',
        'accent-hover': '#7bb082',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};