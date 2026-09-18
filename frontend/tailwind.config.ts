import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        scale: {
          50: '4px',
          100: '8px',
          200: '14px',
          300: '24px',
          400: '32px',
          500: '48px',
          600: '64px',
          700: '100px',
          800: '128px',
          900: '158px',
          950: '200px',
        }
      },
      fontSize: {
        scale: {
          50: '0.7em',
          100: '0.8em',
          200: '0.9em',
          300: '1em',
          400: '1.1em',
          500: '1.2em',
          600: '1.5em',
          700: '1.8em',
          800: '2em',
          900: '2.5em',
          950: '3em',
        }
      },
      colors: {
        error: {
          50: 'var(--error-50)',
          100: 'var(--error-100)',
          200: 'var(--error-200)',
          300: 'var(--error-300)',
          400: 'var(--error-400)',
          500: 'var(--error-500)',
          600: 'var(--error-600)',
          700: 'var(--error-700)',
          800: 'var(--error-800)',
          900: 'var(--error-900)',
          950: 'var(--error-950)',
          DEFAULT: 'var(--error)',
        },
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950)',
          DEFAULT: 'var(--primary)',
        },
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
          950: 'var(--secondary-950)',
          DEFAULT: 'var(--secondary)',
        },
        modal: {
          bg: 'var(--modal-bg)',
          'footer-bg': 'var(--modal-footer-bg)',
          title: 'var(--modal-title)',
          desc: 'var(--modal-desc)',
          border: 'var(--modal-border)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
