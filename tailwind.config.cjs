/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(24, 24, 27, 0.75)',
          border: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(39, 39, 42, 0.85)',
        }
      },
      boxShadow: {
        'glass-glow': '0 0 25px -5px rgba(99, 102, 241, 0.15)',
        'bento-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-blue-500',
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'md:col-span-2',
    'md:col-span-3',
    'lg:col-span-2',
    'lg:col-span-3',
  ]
}
