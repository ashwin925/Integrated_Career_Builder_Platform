// campus-platform/tailwind.config.js (root)
module.exports = {
  darkMode: "class", // use class-based dark mode (we default to <html class="dark">)
  content: [
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
