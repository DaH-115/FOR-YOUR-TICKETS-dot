import type { Config } from "tailwindcss";
import scrollbarHide from "tailwind-scrollbar-hide";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
      },
      colors: {
        primary: {
          50: "#FDF2F4",
          100: "#F7D9E0",
          200: "#F0B5C3",
          300: "#E38FA6",
          400: "#D66A89",
          500: "#8B1E3F", // 기본 버건디
          600: "#701832",
          700: "#551226",
          800: "#3A0C19",
          900: "#1E060D",
        },
        accent: {
          50: "#FBF7E8",
          100: "#F7EFD1",
          200: "#ECD594",
          300: "#D4AF37", // 기본 골드
          400: "#BD9C31",
          500: "#A6892B",
          600: "#8F7625",
          700: "#78631F",
          800: "#615019",
          900: "#4A3D13",
        },
      },
      animation: {
        scroll: "scroll 40s linear infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      transformGpu: {
        gpu: "translateZ(0)",
      },
    },
  },
  plugins: [
    scrollbarHide,
    // 커스텀 유틸리티 플러그인
    function ({
      addUtilities,
    }: {
      addUtilities: (utilities: Record<string, Record<string, string>>) => void;
    }) {
      const newUtilities = {
        ".mask-linear-gradient": {
          "mask-image":
            "linear-gradient(to bottom, black 60%, transparent 100%)",
          "-webkit-mask-image":
            "linear-gradient(to bottom, black 60%, transparent 100%)",
        },
        ".transition-delay-300": {
          "transition-delay": "300ms",
        },
        ".transition-delay-500": {
          "transition-delay": "500ms",
        },
        ".transition-delay-700": {
          "transition-delay": "700ms",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
