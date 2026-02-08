/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        usf: {
          green: "#006747",
          gold: "#CFC096",
          ink: "#2D3748",
          mist: "#F4F7F6",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.12)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Work Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
