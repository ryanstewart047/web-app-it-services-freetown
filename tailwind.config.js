/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './*.html',
    './assets/**/*.{js,html}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#040e40',
          50: '#f0f2ff',
          100: '#e4e8ff',
          200: '#cdd5ff',
          300: '#a6b4ff',
          400: '#7885ff',
          500: '#4c56ff',
          600: '#2c2fff',
          700: '#1f1ae3',
          800: '#1a16b8',
          900: '#1c1891',
          950: '#040e40',
        },
        danger: {
          DEFAULT: '#ff0000',
          50: '#fff0f0',
          100: '#ffdddd',
          200: '#ffc0c0',
          300: '#ff9494',
          400: '#ff5757',
          500: '#ff2323',
          600: '#ff0000',
          700: '#d70000',
          800: '#b10000',
          900: '#920000',
          950: '#500000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
