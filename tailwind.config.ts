import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        base: {
          950: '#030712',
          900: '#050814',
          800: '#0b1024',
          700: '#121a39',
          300: '#a7b4d9',
          100: '#dfe7ff',
          50: '#f5f7ff',
        },
        accent: {
          primary: '#6da3ff',
          blue: '#4b7cff',
          secondary: '#5ce1ff',
        },
      },
      boxShadow: {
        deep: '0 30px 90px rgba(0, 0, 0, 0.35)',
        card: '0 16px 40px rgba(0, 0, 0, 0.2)',
        glow: '0 20px 60px rgba(124, 140, 255, 0.35)',
      },
      borderRadius: {
        xl: '18px',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at 20% 20%, rgba(124,140,255,0.28), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,122,181,0.18), transparent 32%), radial-gradient(circle at 10% 80%, rgba(111,255,233,0.16), transparent 32%)',
      },
    },
  },
  plugins: [],
};

export default config;
