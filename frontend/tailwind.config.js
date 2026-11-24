/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        pmh: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d0ff',
          300: '#90b0ff',
          400: '#6090ff',
          500: '#3070ff',
          600: '#0025ff',
          700: '#0019cc',
          800: '#001299',
          900: '#000c66',
          950: '#000633',
        },
        slate: {
          850: '#1a2332',
          950: '#0d1117',
        },
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(0, 0, 0, 0.12)',
        glow: '0 0 40px -10px rgba(0, 37, 255, 0.35)',
      },
    },
  },
  plugins: [],
};
