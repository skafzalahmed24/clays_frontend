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
        heading: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        script: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'input': '10px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'pan-slow': 'panSlow 20s linear infinite alternate',
        'hover-lift': 'hoverLift 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        panSlow: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.05) translate(-1%, -1%)' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' },
          '100%': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)' },
        }
      },
    },
  },
  plugins: [],
}
