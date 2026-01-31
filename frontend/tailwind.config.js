/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-black': '#000000',
        'card-bg': '#09090b',
        'card-border': 'rgba(39, 39, 42, 0.5)',
        'accent-cyan': '#22d3ee',
      },
      backdropBlur: {
        'premium': '16px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
        'glow-cyan-lg': '0 0 40px rgba(34, 211, 238, 0.4)',
      },
      animation: {
        'scale-up': 'scaleUp 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
