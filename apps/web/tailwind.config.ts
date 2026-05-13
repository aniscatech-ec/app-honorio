import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#f4e2d5',
          1: '#ede0d4',
          2: '#e5d4c4',
          3: '#dcc8b4',
          4: '#d4bca4',
        },
        card: { DEFAULT: '#ffffff', 2: '#faf4ef' },
        bdr: { DEFAULT: '#d8c8b8', 2: '#c8b4a0', 3: '#b09880' },
        gold: { DEFAULT: '#9a6e10', 2: '#b8860e', 3: '#c8940e', 4: '#7a5008' },
        ink: { DEFAULT: '#2a1f14', 2: '#5a4030', 3: '#8a6848', 4: '#b09070' },
        grn: { DEFAULT: '#1e5c2a', 2: '#2e8c40', 3: '#1a7030' },
        blu: { DEFAULT: '#1a3a6c', 2: '#2a5aac', 3: '#1a4a8c' },
        pur: { DEFAULT: '#3a1c6c', 2: '#6a3aac', 3: '#5a2a9c' },
        red: { DEFAULT: '#6c1c1c', 2: '#ac3030', 3: '#8c2020' },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: { rr: '8px', rl: '12px' },
    },
  },
  plugins: [],
}
export default config
