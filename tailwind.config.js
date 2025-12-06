/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
        "*.{js,ts,jsx,tsx,mdx}"
    ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        "background-light": "#ffffff",
        "background-dark": "#0a0a0a",
        "card-light": "#F9FAFB",
        "card-dark": "#1F2937",
        "border-light": "#E5E7EB",
        "border-dark": "#374151",
        "sage-bg": "rgb(243 244 246)",
        "sage-text": "rgb(17 24 39)",
        "sage-border": "rgb(209 213 219)",
        "sage-secondary-text": "rgb(75 85 99)",
        "sage-accent": "rgb(79 70 229)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      // PHASE 4: Consistent spacing scale
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      boxShadow: {
        'cinematic': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'cinematic-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'sage-active': '0 0 12px 3px rgb(199 210 254 / 0.7)',
      }
    },
  },
  plugins: [],
}
