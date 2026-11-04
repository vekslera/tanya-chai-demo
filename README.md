# tanya-chai-demo

A static, Hebrew-first demo of **Tanya Chai (תניא חי)**: the daily portion of Tanya with a short ביאור and questions (the Matmid path), and tools for a father learning the same portion with his son (Avos uBanim). The demo portion is ט׳ אדר (Likkutei Amarim, chapter 32, first half).

`SPEC.md` is the source of truth; `CLAUDE.md` holds the working rules.

## Running it

Node 20.19+ is required.

```sh
npm install
npm run dev               # local dev server (builds the units first)
npm run build             # production build into dist/ (VITE_BASE sets the base path)
npm run preview           # serve the production build
```

Optional feature: `VITE_FEATURE_SHINUN=true npm run dev` shows the Shinun taste (off by default).

## Checks

```sh
npm run lint              # ESLint and Prettier
npm test                  # Vitest: text layer, content integrity, scoring, streak, shuffling
npm run validate-content  # SPEC §6.5 integrity rules; CONTENT_STRICT=1 also fails on unreviewed items
```

## Content pipeline

| Step | Command | Output |
| --- | --- | --- |
| Units from the raw text and the splits (runs before dev, build and test) | `npm run build-units` | `data/units/he/LA/32.json` (generated, not committed) |
| English spans from `resources/texts/ENG/tanya/LA/32` | `node scripts/build-translations.mjs` | `data/translations/en/LA/32.json` |
| Glossary matches written without nikud → exact vocalized text | `node scripts/resolve-matches.mjs` | `content/LA/32.json` |
| Review document for Alex | `npm run review` | `content/REVIEW.md` |
| Overlap check against the local Shiurim file (Alex's machine only) | `npm run check-overlap` | report |

The English resource file has one paragraph per line, with footnote marks written `[n]` where they apply, then a blank line and one footnote per line (`[n] text`).

The Tanya text is never edited: it is only split into units by their opening words (`data/splits/`), and every other layer points into it by unit ID.

## License

The source code is licensed under the Apache License 2.0 (see `LICENSE`).
The Tanya texts, the original learning content, and the Tanya Chai name and logo are not covered by it; see `NOTICE` for their terms.

### Content license

The Hebrew and English texts of Tanya are used under their own licenses (Kehot Publication Society, via Sefaria, CC BY-NC). The ביאור, glossary, questions and Avos uBanim materials are © Tanya Chai, all rights reserved. Details: [`content/CONTENT-LICENSE.md`](content/CONTENT-LICENSE.md).
