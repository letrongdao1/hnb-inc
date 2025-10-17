import { heroui } from "@heroui/react";

// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
            background: "#FFFFFF", // or DEFAULT
            foreground: "#11181C", // or 50 to 900 DEFAULT
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#2166B0",
            },
            secondary: {
              foreground: "#FFFFFF",
              DEFAULT: "#27AB9F",
            }
          },
        },
        dark: {
          colors: {
            background: "#000000", // or DEFAULT
            foreground: "#333333", // or 50 to 900 DEFAULT
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#2166B0",
            },
            secondary: {
              foreground: "#FFFFFF",
              DEFAULT: "#27AB9F",
            }
          },
        },
      },
    }),
  ],
};
