/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f0f0f',
        'bg-secondary': '#1a1a1a',
        'bg-tertiary': '#262626',
        'accent-primary': '#e50914',
        'accent-secondary': '#b20710',
        'accent-gold': '#ffd700',
        'text-primary': '#ffffff',
        'text-secondary': '#a3a3a3',
        'text-muted': '#737373',
        'border-subtle': '#333333',
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      maxWidth: {
        '1800': '1800px',
      },
    },
  },
  plugins: [],
}