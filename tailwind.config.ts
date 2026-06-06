import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F5F2",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#181614",
          muted: "#6E6A65",
          faint: "#9C9890",
        },
        border: {
          DEFAULT: "#E5E1DB",
          strong: "#D4CFC6",
        },
        accent: {
          DEFAULT: "#2D4A3E",
          light: "#4A6B5C",
          muted: "#E8EFEB",
        },
        signal: {
          birth: "#3D6B8E",
          death: "#8B4A42",
          emergency: "#A65D2E",
          migration: "#5C6B4A",
        },
        brand: {
          orange: "#E5530E",
          "orange-light": "#F06A28",
          "orange-deep": "#C94308",
          brown: "#4B1105",
        },
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-ibm-plex)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(24, 22, 20, 0.04), 0 4px 12px rgba(24, 22, 20, 0.03)",
        elevated: "0 2px 8px rgba(24, 22, 20, 0.06), 0 8px 24px rgba(24, 22, 20, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
