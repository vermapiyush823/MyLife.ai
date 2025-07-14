/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0B1119',
        surface: '#1E293B',
        primary: '#2979FF',
        secondary: '#60A5FA',
        textPrimary: '#F1F5F9',
        textSecondary: '#94A3B8',
        danger: '#EF4444',
        success: '#22C55E',
        info: '#38BDF8',
      },
    },
  },
  plugins: [],
};
