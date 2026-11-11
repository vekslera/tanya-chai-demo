# tanya-chai-demo

A static, Hebrew-first demo of **Tanya Chai (תניא חי)**: the daily portion of Tanya with a short ביאור and questions (the Matmid path), and tools for a father learning the same portion with his son (Avos uBanim). The demo portion is ט׳ אדר (Likkutei Amarim, chapter 32, first half).

`SPEC.md` is the source of truth; `CLAUDE.md` holds the working rules.

## Running it

Node 22.18+ is required (it runs the TypeScript scripts directly).

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
npm test                  # Vitest: every module of the app and the scripts
npm run coverage          # the same, failing below 100% line and branch coverage (run in CI)
npm run validate-content  # SPEC §6.5 integrity rules; CONTENT_STRICT=1 also fails on unreviewed items
```

## Deployment

GitHub Pages publishes one site with two builds (SPEC §10): `main`, the stable demo, at `https://demo.tanyachai.app/`, and `dev`, the current state, at `https://demo.tanyachai.app/dev/`. A push to either branch runs `.github/workflows/deploy.yml`, which checks and rebuilds both; `main` must pass `CONTENT_STRICT=1`.

## Content pipeline

Every file path, the chapter list and the Sefaria refs are named once, in [`texts.config.json`](texts.config.json). The app's parameters (scoring, attempts, timings, demo values, the validator's content rules) are named once, in [`app.config.json`](app.config.json).

| Step | Command | Output |
| --- | --- | --- |
| Download the Hebrew and English from Sefaria (once; checks version and license) | `npm run fetch-sefaria` | `resources/texts/{he,en}/tanya/LA/32` and the raw `32.sefaria.json` |
| Units from the raw text and the splits, in each language (runs before dev, build and test) | `npm run build-units` | `data/units/{he,en}/LA/32.json` (generated, not committed) |
| English spans from the English resource, one per unit (from the English splits) | `npm run build-translations` | `data/translations/en/LA/32.json` |
| Glossary matches written without nikud → exact vocalized text | `npm run resolve-matches` | `content/LA/32.json` |
| Review document for Alex | `npm run review` | `content/REVIEW.md` |
| Printable ביאור משולב, one per language: the Tanya text in bold with the ביאור woven in, as an editable Word file | `npm run print` | `out/biur-meshulav-{he,en}-LA-32.docx` (not committed) |
| Overlap check against the local Shiurim file (Alex's machine only) | `npm run check-overlap` | report |

The English resource file has one paragraph per line, with footnote marks written `[n]` where they apply, then a blank line and one footnote per line (`[n] text`).

The Tanya text is never edited: it is only split into units by their opening words (`data/splits/he/`), and every other layer points into it by unit ID. The English is split into the same units (`data/splits/en/`), so the ביאור, written in both languages, can be woven into either text.

## Code structure

The code follows four rules (SPEC §5.4): no hardcoded parameters, single responsibility and dependency inversion, small files, and tests for all the code.

- `src/domain/`: the pure logic, with no React and no DOM, shared by the app and the scripts.
- `src/ports.ts`: what the app needs from outside (the text, the learning content, storage). `src/adapters/` implements it with the bundled files and `localStorage`, and `src/composition.ts` is the one place that chooses them. A Sefaria-backed text source would be a new adapter and a change in that file.
- `src/screens/<screen>/`: each screen, split into small views; `src/hooks/`, `src/components/`, `src/store/` as named.
- `scripts/`: thin entry points over `scripts/lib/`. Each script takes a `ScriptEnv` (files, log, network, clock), so the tests run it in memory.
- `virtual.vite.ts`: serves the data files (`virtual:texts`), `app.config.json` (`virtual:app-config`) and the logo's paths (`virtual:brand`) to the app at build time.

## License

The source code is licensed under the Apache License 2.0 (see `LICENSE`).
The Tanya texts, the original learning content, and the Tanya Chai name and logo are not covered by it; see `NOTICE` for their terms.

### Content license

The Hebrew and English texts of Tanya are used under their own licenses (Kehot Publication Society, via Sefaria, CC-BY-NC). The ביאור, glossary, questions and Avos uBanim materials are © Tanya Chai, all rights reserved. Details: [`content/CONTENT-LICENSE.md`](content/CONTENT-LICENSE.md).
