module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f7f5",
          100: "#d9eee8",
          200: "#b3ddd3",
          300: "#8ccbbe",
          400: "#66baa9",
          500: "#5e9b8c",
          600: "#4a7c6f",
          700: "#3d7a6b",
          800: "#2d5e52",
          900: "#1e423a",
        },
        secondary: {
          50: "#f0f6f8",
          100: "#d9ecf1",
          200: "#b3d9e3",
          300: "#8cc6d5",
          400: "#66b3c7",
          500: "#5a8fa8",
          600: "#4a7287",
          700: "#3d7a6b",
          800: "#2d5e52",
          900: "#1e423a",
        },
      },
    },
  },
  plugins: [],
};
