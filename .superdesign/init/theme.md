# Theme and Design Tokens

## Compact token summary

- Direction: RTL, Arabic-first.
- Font: `SF Arabic`, weights 300/400/500/600/700.
- Page width: 100% below desktop, 92% at 1024px and above.
- Primary task action: teal `#14b8a6` / hover `#0d9488`.
- Core neutral action: neutral-900 `#171717`.
- Task workspace background: `#FAFCFF`.
- Task conversation outgoing bubble: `#d9fdd3`; incoming: white.
- Status colors: gray/todo, blue/in progress, amber/in review, emerald/completed, rose/overdue.
- Radius: 8px controls, 12px cards, 16px major modals.
- Shadows: subtle card shadow; elevated drawer/modal shadow.
- Breakpoints: Tailwind defaults (`sm` 640, `md` 768, `lg` 1024).
- Typography: 12px metadata, 14px body/control, 18–20px task titles.
- Spacing rhythm: 4px micro, 8px compact, 12px controls, 16–24px sections.

## `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neutral: {
          50: 'rgb(var(--neutral-50) / <alpha-value>)',
          100: 'rgb(var(--neutral-100) / <alpha-value>)',
          200: 'rgb(var(--neutral-200) / <alpha-value>)',
          300: 'rgb(var(--neutral-300) / <alpha-value>)',
          400: 'rgb(var(--neutral-400) / <alpha-value>)',
          500: 'rgb(var(--neutral-500) / <alpha-value>)',
          600: 'rgb(var(--neutral-600) / <alpha-value>)',
          700: 'rgb(var(--neutral-700) / <alpha-value>)',
          800: 'rgb(var(--neutral-800) / <alpha-value>)',
          900: 'rgb(var(--neutral-900) / <alpha-value>)',
          950: 'rgb(var(--neutral-950) / <alpha-value>)',
        },
      },
      fontFamily: { sans: ['SF Arabic', 'sans-serif'] },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
};
```

## Core CSS variables from `src/index.css`

```css
:root {
  --page-max-w: 100%;
  --neutral-50: 250 250 250;
  --neutral-100: 245 245 245;
  --neutral-200: 229 229 229;
  --neutral-300: 212 212 212;
  --neutral-400: 163 163 163;
  --neutral-500: 115 115 115;
  --neutral-600: 82 82 82;
  --neutral-700: 64 64 64;
  --neutral-800: 38 38 38;
  --neutral-900: 23 23 23;
  --neutral-950: 10 10 10;
}
.dark {
  --neutral-50: 240 242 252;
  --neutral-100: 230 233 247;
  --neutral-200: 205 210 233;
  --neutral-300: 172 179 210;
  --neutral-400: 128 136 170;
  --neutral-500: 94 102 138;
  --neutral-600: 58 66 102;
  --neutral-700: 36 42 74;
  --neutral-800: 17 21 41;
  --neutral-900: 12 15 31;
  --neutral-950: 7 9 21;
}
@media (min-width: 1024px) {
  :root { --page-max-w: 92%; }
}
```

The full CSS source is `src/index.css` (325 lines), including font-face declarations, responsive input behavior, dark surfaces, and the task conversation bubble tails.
