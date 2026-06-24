import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          900: "#7f1d1d",
        },
      },
      keyframes: {
        "page-slide-in-next": {
          "0%": { opacity: "0", transform: "translateX(28px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "page-slide-in-prev": {
          "0%": { opacity: "0", transform: "translateX(-28px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
      },
      animation: {
        "page-slide-in-next": "page-slide-in-next 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        "page-slide-in-prev": "page-slide-in-prev 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
