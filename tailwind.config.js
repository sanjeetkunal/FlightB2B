/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};


module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        hammersmith: ["'Hammersmith One'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        fly: {
          '0%':   { transform: 'translateX(-20%) translateY(0) rotate(-6deg)' },
          '50%':  { transform: 'translateX(20%) translateY(-10%) rotate(4deg)' },
          '100%': { transform: 'translateX(-20%) translateY(0) rotate(-6deg)' },
        },
        floatShadow: {
          '0%':   { transform: 'scale(1)', opacity: '0.18' },
          '50%':  { transform: 'scale(1.08)', opacity: '0.25' },
          '100%': { transform: 'scale(1)', opacity: '0.18' },
        }
      },
      animation: {
        fly: 'fly 6s ease-in-out infinite',
        'shadow-pulse': 'floatShadow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}