/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pearl: {
          50: '#FDFBF7',
          100: '#FAF7F0', // Pearl Ivory
          200: '#F5EFE4',
          300: '#EFE6D5',
        },
        cream: {
          100: '#F7F2EB',
          200: '#F2EADF', // Warm Cream
          300: '#E8DCCB',
        },
        gold: {
          champagne: '#C5A15B', // Champagne Gold
          pale: '#E8D5A8', // Pale Gold
          light: '#F4ECD4',
          hover: '#B59048',
          dark: '#8C6C30',
        },
        silver: {
          brushed: '#C7CBD1', // Brushed Silver
          soft: '#ECEDEF', // Soft Silver
          tint: '#F3F4F6',
          border: '#D8DCE2',
        },
        blush: {
          50: '#FDF7F9',
          100: '#F5DDE3', // Blush Pink
          200: '#ECC6CE',
          rose: '#D99AA6', // Dusty Rose
          dark: '#B87280',
          deep: '#9B3B52', // WCAG AA compliant on light backgrounds (contrast > 5.5:1)
          accent: '#C46D7E',
          soft: '#F8E9ED',
        },
        lavender: {
          mist: '#E9E1F5', // Lavender Mist
          soft: '#F3EEFB',
          border: '#D7C7EE',
        },
        espresso: {
          charcoal: '#302C2B', // Espresso Charcoal
          deep: '#23201F',
          muted: '#615A58',
          light: '#8C8380',
        },
        sage: {
          muted: '#4E775B', // Muted Sage
          soft: '#E8EFEA',
          border: '#B6CEBC',
        },
        expense: {
          muted: '#BA5A5A', // Soft Muted Red
          soft: '#F9ECEC',
          border: '#E8B9B9',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Manrope"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'pearl': '0 4px 20px -2px rgba(48, 44, 43, 0.05), 0 2px 6px -1px rgba(48, 44, 43, 0.03)',
        'sticky-pink': '0 10px 25px -5px rgba(217, 154, 166, 0.22), 0 4px 10px -2px rgba(217, 154, 166, 0.12)',
        'gold-glow': '0 8px 30px -4px rgba(197, 161, 91, 0.18)',
        'card-subtle': '0 1px 3px rgba(48, 44, 43, 0.04), 0 6px 16px -4px rgba(48, 44, 43, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
