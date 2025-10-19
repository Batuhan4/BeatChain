# Repository Guidelines

## Project Structure & Module Organization
BeatChain runs on Next.js 15 with the app router. Page segments and UI live in `app/`, component primitives sit under `app/components/`, and shared providers are in `app/providers.tsx`. Smart-contract helpers and client utilities are collected in `lib/` (for example `lib/contract.ts` and `lib/wagmiConfig.ts`). On-chain artifacts remain at the root (`beatchain.sol`, `remappings.txt`), while static assets and styling live in `public/`, `app/globals.css`, and `app/theme.css`. Use `scripts/` for repeatable ops such as uploads or contract interactions.

## Build, Test, and Development Commands
Run `pnpm dev` to launch the local Next.js server with the Turbo runtime. Use `pnpm build` for a production-ready bundle and `pnpm start` to serve the compiled output. Keep code quality in check with `pnpm lint`, which applies the Next.js ESLint config across TypeScript and React files.

## Coding Style & Naming Conventions
TypeScript and React files should use ES modules, camelCase for variables/functions, and PascalCase for components (`MyComponent.tsx`). Keep React server components in `.tsx` files within route folders and colocate client components in `app/components/`. Prettier (via the ESLint Prettier plugin) enforces 2-space indentation and trailing commas, so run the lint command before pushing. Store environment-specific constants in `.env.local`; never commit secrets.

## Testing Guidelines
Automated tests are not yet configured. When introducing tests, prefer colocated Jest or Vitest suites named `*.test.ts(x)` and execute them via a dedicated `pnpm test` script. At minimum, smoke-test new flows manually in the local Next.js server and document any gaps in the PR description.

## Commit & Pull Request Guidelines
Follow the conventional, lowercase prefix seen in history (`feat:`, `chore:`, `docs:`) and keep subjects under 72 characters. Group related changes per commit; avoid mixing contract and frontend edits without explanation. PRs should include: a concise summary, screenshots or screen recordings for UI tweaks, contract deployment notes when ABIs or addresses change, and references to Farcaster frame updates. Request review from code owners of the touched areas and wait for CI (lint/build) results before merging.
