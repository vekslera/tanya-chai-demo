# CLAUDE.md: working rules for this repository

This repo is the **Tanya Chai (תניא חי) demo**: a static, Hebrew-first, RTL web demo of the Matmid path and of Avos uBanim (לימוד אבות ובנים), a father learning with his son. The project's message is chayus and understanding in learning Tanya, not memorization. **`SPEC.md` is the source of truth.** Read it before starting any milestone, and follow its milestone order (§11).

## Hard rules

- **Lessons in Tanya is a local reference only.** The Hebrew Shiurim in `resources/texts/he/shiurim/` is excluded from Git and must never be committed. You may read it to check the meaning of the text, but never quote, paraphrase, reword or follow its order of explanation (SPEC §2, §8.3). The same applies to any other copyrighted commentary. The repo is public.
- **Never edit the Tanya text.** The Hebrew comes from `resources/texts/he/` (with nikud) and is stored only there. Units are defined in `data/splits/` by their opening words; `data/units/` is generated and never edited. Everything else points at unit IDs, which are never renumbered (SPEC §6). The validator checks this (`npm run validate-content`).
- **Torah content needs Alex's approval.** Every ביאור, glossary entry, question and Avos uBanim item starts with `reviewed: false`. Only Alex flips it, or you flip it on his explicit instruction for the specific items he approved.
- **No external requests at runtime:** no Google Fonts, CDNs, embeds, analytics or live Sefaria calls. Fonts are self-hosted via `@fontsource`.
- **Do not modify anything under `resources/` by hand** (logo files and texts). The texts change only through `npm run fetch-sefaria`, run on Alex's instruction. Build the `HeartMark` component from the same path data as `resources/brand/logo/`.
- **Never hardcode a resource or data file path in code.** Every path is named once, in `texts.config.json`; scripts read it through `scripts/lib/config.ts`, and the app through `virtual:texts`.
- The name is written **חי, without gershayim**. The Tanya text is shown exactly as in the resource file.

## Conventions

- **Stack:** Vite + React 18 + TypeScript (strict), plain CSS with the tokens from SPEC §4.1, hash routing, a `useReducer` store.
- **RTL:** `<html lang="he" dir="rtl">`. English blocks get `dir="ltr" lang="en"`. Use `<bdi>` for mixed-direction runs. Use logical CSS properties (`margin-inline-start`, `padding-inline`), never left/right.
- **UI strings:** all of them go in `src/strings/he.ts`. Use Chabad terminology: ביאור (not הסבר), שיעור, לימוד. Words of learning, not of games: never call the study a game (משחק). The tone is respectful and warm.
- **Storage:** wrap every `localStorage` access in try/catch. The app must work without storage.
- **Motion:** respect `prefers-reduced-motion` everywhere.
- Mobile first (360–430px), with a centered single column up to 680px on desktop.

## Workflow

- Work on one branch per milestone (`m0-scaffold`, `m1-texts`, …) and keep commits small.
- Do not push or merge to `main` without Alex's go-ahead.
- Before saying a milestone is done, run:
  - `npm run lint`
  - `npm run validate-content`
  - `npm run build`
  - a check of the screens at 360px width
- When something in the spec is unclear or conflicts with reality (an unexpected Sefaria license, the portion boundaries, a design that does not fit), stop and ask Alex rather than guessing.

## Commands (once scaffolded)

- `npm run dev`: local dev server
- `npm run build`: production build (`VITE_BASE` sets the base path)
- `npm run build-units`: regenerate `data/units/` from the raw text and the splits (runs automatically before dev and build)
- `npm run validate-content`: content schema and integrity checks (`CONTENT_STRICT=1` fails on unreviewed items)
- `npm run fetch-sefaria`: download the Hebrew and English from Sefaria into `resources/texts/` (SPEC §8.1); never at build time or runtime
