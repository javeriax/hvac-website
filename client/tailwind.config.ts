import type { Config } from 'tailwindcss';

/**
 * ServiceFlow design tokens.
 *
 * The palette is built on HVAC's own duality: `frost` for cooling, `ember` for
 * heating. Everything else is a neutral instrument surface so those two colours
 * carry all the meaning. Values resolve from CSS variables so a single
 * `data-theme` swap on <html> re-skins the whole application.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'rgb(var(--c-page) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        sunken: 'rgb(var(--c-sunken) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        frost: {
          DEFAULT: 'rgb(var(--c-frost) / <alpha-value>)',
          soft: 'rgb(var(--c-frost-soft) / <alpha-value>)',
          deep: 'rgb(var(--c-frost-deep) / <alpha-value>)',
        },
        ember: {
          DEFAULT: 'rgb(var(--c-ember) / <alpha-value>)',
          soft: 'rgb(var(--c-ember-soft) / <alpha-value>)',
          deep: 'rgb(var(--c-ember-deep) / <alpha-value>)',
        },
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        lift: '0 1px 2px rgb(0 0 0 / 0.04), 0 12px 32px -12px rgb(0 0 0 / 0.18)',
        deep: '0 24px 70px -28px rgb(0 0 0 / 0.55)',
        'glow-frost': '0 0 0 1px rgb(var(--c-frost) / 0.35), 0 0 34px -8px rgb(var(--c-frost) / 0.45)',
        'glow-ember': '0 0 0 1px rgb(var(--c-ember) / 0.35), 0 0 34px -8px rgb(var(--c-ember) / 0.45)',
      },
      backgroundImage: {
        'thermal': 'linear-gradient(100deg, rgb(var(--c-frost)), rgb(var(--c-ember)))',
        'thermal-soft':
          'linear-gradient(100deg, rgb(var(--c-frost) / 0.16), rgb(var(--c-ember) / 0.16))',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'sweep': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(220%)' } },
        'pulse-ring': {
          '0%': { transform: 'scale(.9)', opacity: '.7' },
          '70%': { transform: 'scale(1.5)', opacity: '0' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'drift': {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' },
        },
        'marquee': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.22,1,.36,1) both',
        'fade-in': 'fade-in .4s ease both',
        'scale-in': 'scale-in .18s cubic-bezier(.22,1,.36,1) both',
        sweep: 'sweep 2.4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(.24,.6,.36,1) infinite',
        drift: 'drift 7s ease-in-out infinite',
        marquee: 'marquee 34s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
