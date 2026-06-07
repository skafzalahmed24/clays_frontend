/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        dark: 'var(--color-dark)',
        light: 'var(--color-light)',
        accent: 'var(--color-accent)',
        body: 'var(--color-body-bg)',
        'text-main': 'var(--color-text-main)',
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        body: ['Cinzel', 'serif'],
        script: ['"Abril Fatface"', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 1.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'pan-slow': 'panSlow 20s linear infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        panSlow: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.1) translate(-1%, -1%)' },
        }
      },
    },
  },
  plugins: [],
}
