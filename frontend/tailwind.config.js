/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Important: Tailwind styles shouldn't conflict with MUI
  important: "#root",
  corePlugins: {
    // Disable preflight as MUI has its own CSS reset
    preflight: false,
  },
  theme: {
    extend: {
      // Keep MUI breakpoints in sync with Tailwind
      screens: {
        xs: "0px",
        sm: "600px",
        md: "900px",
        lg: "1200px",
        xl: "1536px",
      },
    },
  },
  plugins: [],
};
