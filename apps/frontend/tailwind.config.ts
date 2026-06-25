import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#01696f',
          hover: '#0c4e54',
          active: '#0f3638',
          highlight: '#cedcd8',
        },
        surface: {
          DEFAULT: '#f9f8f5',
          2: '#fbfbf9',
          offset: '#f3f0ec',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
