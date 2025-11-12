import { heroui } from "@heroui/react";

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        title: ["var(--font-alfaSlabOne)", "sans-serif"],
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#2166B0",
            },
            secondary: {
              foreground: "#FFFFFF",
              DEFAULT: "#27AB9F",
            },
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#333333",
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#2166B0",
            },
            secondary: {
              foreground: "#FFFFFF",
              DEFAULT: "#27AB9F",
            },
          },
        },
      },
    }),
  ],
};
