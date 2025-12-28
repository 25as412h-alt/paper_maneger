// tailwind.config.js - Tailwind CSS設定
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          gray: {
            650: '#4b5563'
          }
        }
      }
    },
    plugins: []
  };