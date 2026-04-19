// Donna Life Manager — design tokens (semantic, theme-aware).
// Colors reference CSS vars declared in src/styles/globals.css under
// :root (light) and [data-theme="dark"]. Switching theme = flipping the
// attribute on <html>; utility classes update automatically.
//
// Full token reference + future tweaks (emerald/ink accents) live in
// src/styles/tokens.md.
//
// Wired into Tailwind v4 via `@config "../tailwind.config.js"` in globals.css.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        'canvas-soft': 'var(--canvas-soft)',
        card: 'var(--card)',
        'card-alt': 'var(--card-alt)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-muted': 'var(--ink-muted)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'decor-rose': 'var(--decor-rose)',
        'decor-rose-soft': 'var(--decor-rose-soft)',
        'decor-taupe': 'var(--decor-taupe)',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xs: '7px',
        sm: '12px',
        md: '14px',
        lg: '20px',
        xl: '22px',
        '2xl': '24px',
        pill: '9999px',
      },
      fontSize: {
        xs: ['10px', { lineHeight: '14px' }],
        sm: ['12px', { lineHeight: '16px' }],
        base: ['13px', { lineHeight: '18px' }],
        md: ['15px', { lineHeight: '21px' }],
        lg: ['18px', { lineHeight: '24px' }],
        xl: ['22px', { lineHeight: '28px' }],
        '2xl': ['32px', { lineHeight: '36px' }],
        '3xl': ['34px', { lineHeight: '41px' }],
      },
      spacing: {
        gutter: '20px',
        section: '26px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
      letterSpacing: {
        label: '0.15em',
        caps: '0.22em',
      },
    },
  },
  plugins: [],
}
