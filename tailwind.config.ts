
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--color-base)',
        'base-light': 'var(--color-base-light)',
        'base-dark': 'var(--color-base-dark)',
      },
    },
  },
  plugins: [typography],
};

