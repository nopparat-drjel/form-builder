import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#f0f9f1",
          100: "#dcf0df",
          200: "#bbe2c1",
          300: "#8dcb97",
          400: "#5aaf6a",
          500: "#48b356",
          600: "#339143",
          700: "#2d7a3a",
          800: "#265f30",
          900: "#1a4d24",
          950: "#0e2b14",
        },
        neu: {
          bg: "#f5f5f5",
          shadow: "#cecece",
          light: "#ffffff",
        },
      },
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
        sarabun: ["Sarabun", "sans-serif"],
        sans: ["Prompt", "Sarabun", "sans-serif"],
      },
      boxShadow: {
        neu: "8px 8px 16px #cecece, -8px -8px 16px #ffffff",
        "neu-sm": "4px 4px 8px #cecece, -4px -4px 8px #ffffff",
        "neu-xs": "2px 2px 4px #cecece, -2px -2px 4px #ffffff",
        "neu-in": "inset 4px 4px 8px #cecece, inset -4px -4px 8px #ffffff",
        "neu-in-sm": "inset 2px 2px 4px #cecece, inset -2px -2px 4px #ffffff",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      spacing: {
        sidebar: "224px",
      },
    },
  },
  plugins: [],
};

export default config;
