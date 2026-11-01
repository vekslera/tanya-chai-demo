# CLAUDE.md: working rules for this repository

This repo is the **Tanya Chai (תניא חי) demo**: a static, Hebrew-first, RTL web demo of the Matmid path. **`SPEC.md` is the source of truth.** Read it before starting any milestone, and follow its milestone order (§11).

## Hard rules

- **No Lessons in Tanya**, and no other copyrighted commentary, anywhere in this repo: not quoted, paraphrased or used as a source. The repo is public.
- **Never edit the Tanya text.** It is only split into sentences. The validator checks this (`npm run validate-content`).
- **Torah content needs Alex's approval.** Every ביאור, glossary entry and question starts with `reviewed: false`. Only Alex flips it, or you flip it on his explicit instruction for the specific items he approved.
- **No external requests at runtime:** no Google Fonts, CDNs, embeds, analytics or live Sefaria calls. Fonts are self-hosted via `@fontsource`.
- **Do not modify `brand/logo/`.** Build the `HeartMark` component from the same path data.
- The name is written **חי, without gershayim**. Abbreviations inside the Tanya text keep their original gershayim.

## Conventions

- **Stack:** Vite + React 18 + TypeScript (strict), plain CSS with the tokens from SPEC §4.1, hash routing, a `useReducer` store.
- **RTL:** `<html lang="he" dir="rtl">`. English blocks get `dir="ltr" lang="en"`. Use `<bdi>` for mixed-direction runs. Use logical CSS properties (`margin-inline-start`, `padding-inline`), never left/right.
- **UI strings:** all of them go in `src/strings/he.ts`. Use Chabad terminology: ביאור (not הסבר), שיעור, לימוד. The tone is respectful and warm.
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
- `npm run validate-content`: content schema and integrity checks (`CONTENT_STRICT=1` fails on unreviewed items)
- `npm run fetch-sefaria`: one-time raw text download (SPEC §8.1)
