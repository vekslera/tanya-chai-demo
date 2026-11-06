# CLAUDE.md: working rules for this repository

This repo is the **Tanya Chai (תניא חי) demo**: a static, Hebrew-first, RTL web demo of the Matmid path and of Avos uBanim (לימוד אבות ובנים), a father learning with his son. The project's message is chayus and understanding in learning Tanya, not memorization. **`SPEC.md` is the source of truth.** Read it before starting any milestone, and follow its milestone order (§11).

## Hard rules

- **Lessons in Tanya is a local reference only.** The Hebrew Shiurim in `resources/texts/he/shiurim/` is excluded from Git and must never be committed. You may read it to check the meaning of the text, but never quote, paraphrase, reword or follow its order of explanation (SPEC §2, §8.3). The same applies to any other copyrighted commentary. The repo is public.
- **Never edit the Tanya text.** The Hebrew comes from `resources/texts/he/` (with nikud) and is stored only there. Units are defined in `data/splits/` by their opening words; `data/units/` is generated and never edited. Everything else points at unit IDs, which are never renumbered (SPEC §6). The validator checks this (`npm run validate-content`).
- **Torah content needs Alex's approval.** Every ביאור, glossary entry, question and Avos uBanim item starts with `reviewed: false`. Only Alex flips it, or you flip it on his explicit instruction for the specific items he approved.
- **No external requests at runtime:** no Google Fonts, CDNs, embeds, analytics or live Sefaria calls. Fonts are self-hosted via `@fontsource`.
- **Do not modify anything under `resources/` by hand** (logo files and texts). The texts change only through `npm run fetch-sefaria`, run on Alex's instruction. `HeartMark` draws the logo's own paths, read from `resources/brand/logo/` at build time (`virtual:brand`); never copy them into the code.
- **Never hardcode a resource or data file path in code.** Every path is named once, in `texts.config.json`; scripts read it through `scripts/lib/config.ts`, and the app through `virtual:texts`.
- **Never hardcode a parameter.** Each one is defined once (SPEC §5.4): behavior and content rules in `app.config.json` (read through `src/config.ts` or `scripts/lib/config.ts`), design values in `src/styles/tokens.css`, strings in `src/strings/he.ts`, routes in `src/routes.ts`.
- The name is written **חי, without gershayim**. The Tanya text is shown exactly as in the resource file.

## Code rules (SPEC §5.4)

The demo is the first step toward the full app.

- **Single responsibility.** Pure logic goes in `src/domain/` (no React, no DOM; rules passed as parameters), shared with the scripts. Screens are composed of small views under `src/screens/<screen>/`; one hook per file.
- **Dependency inversion.** The app depends on the interfaces in `src/ports.ts`. Adapters live in `src/adapters/`, and `src/composition.ts` is the only place that chooses them. Scripts take a `ScriptEnv` (`scripts/lib/env.ts`) and keep their logic in `scripts/lib/`; the entry file only wires it.
- **Small files.** Keep code files small to moderate; split by responsibility first.
- **Tests cover all the code.** Every change comes with its tests; `npm run coverage` must stay at 100% of lines and branches. Test screens through the real app with `src/test/renderApp.tsx`, and scripts in memory with `scripts/test/memoryEnv.ts`. Tests never write to the repo.
- Domain modules and everything the scripts import use explicit `.ts` import extensions, so Node can run them directly.

## Conventions

- **Stack:** Vite + React 18 + TypeScript (strict), plain CSS with the tokens from SPEC §4.1, hash routing, a `useReducer` store. Node 22.18+ runs the TypeScript scripts directly. Tests: Vitest, jsdom, Testing Library.
- **RTL:** `<html lang="he" dir="rtl">`. English blocks get `dir="ltr" lang="en"`. Use `<bdi>` for mixed-direction runs. Use logical CSS properties (`margin-inline-start`, `padding-inline`), never left/right.
- **UI strings:** all of them go in `src/strings/he.ts`. Use Chabad terminology: ביאור (not הסבר), שיעור, לימוד. Words of learning, not of games: never call the study a game (משחק). The tone is respectful and warm.
- **Storage:** only through the `KeyValueStorage` port; the browser adapter wraps every `localStorage` access in try/catch. The app must work without storage.
- **Motion:** respect `prefers-reduced-motion` everywhere.
- Mobile first (360–430px), with a centered single column up to 680px on desktop.

## Workflow

- Work on one branch per milestone (`m0-scaffold`, `m1-texts`, …) and keep commits small.
- Do not push or merge to `main` without Alex's go-ahead.
- Before saying a milestone is done, run:
  - `npm run lint`
  - `npm run coverage`
  - `npm run validate-content`
  - `npm run build`
  - a check of the screens at 360px width
- When something in the spec is unclear or conflicts with reality (an unexpected Sefaria license, the portion boundaries, a design that does not fit), stop and ask Alex rather than guessing.

## Commands

- `npm run dev`: local dev server
- `npm run build`: production build (`VITE_BASE` sets the base path)
- `npm test`: all tests; `npm run coverage`: the same, failing below 100% coverage
- `npm run build-units`: regenerate `data/units/` from the raw text and the splits (runs automatically before dev, build and tests)
- `npm run validate-content`: content schema and integrity checks (`CONTENT_STRICT=1` fails on unreviewed items)
- `npm run build-translations`, `npm run resolve-matches`, `npm run review`, `npm run check-overlap`: the content pipeline (README)
- `npm run fetch-sefaria`: download the Hebrew and English from Sefaria into `resources/texts/` (SPEC §8.1); never at build time or runtime
