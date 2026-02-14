# Type to Read

A typing practice app that lets you learn to type while reading content you want to read.

## Tech stack

- Next.js 16 with Turbopack
- React 19 with React Compiler (`reactCompiler: true` in next.config.ts)
- Tailwind CSS 4 with tw-animate-css
- Radix UI primitives + shadcn/ui components (in `components/ui/`)
- TypeScript 5
- ESLint 9 flat config with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

## Project structure

- `app/` — Next.js app router (page.tsx is a server component)
- `components/` — App components + `ui/` for shadcn primitives
- `hooks/` — Custom React hooks
- `lib/` — Utilities, constants, storage helpers

## Commands

- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build
- `npm run lint` — Run ESLint (`npx eslint .`)

## Key patterns

- **React Compiler is enabled.** Do not use `useMemo`, `useCallback`, or `memo` — the compiler handles optimization.

## Rules for making changes

- **When a fix creates more problems, stop and rethink.** Do not chain workarounds. If fixing one lint error introduces another issue, step back and find a simpler approach.
- **Keep it simple.** Prefer the most straightforward solution. Avoid introducing new abstractions, packages, or patterns unless clearly necessary.
- **Read files before editing them.** Understand existing code and patterns before modifying.
