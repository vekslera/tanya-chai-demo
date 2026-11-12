# Tanya Chai (תניא חי): Demo Specification

**Version:** 1.3 (draft for build; demo portion ט׳ אדר, two levels, Avos uBanim cards by thought)
**Owner:** Alex Veksler
**Repository:** `vekslera/tanya-chai-demo` (public; code under Apache-2.0, content under its own terms, see §9)
**Target URL:** `https://demo.tanyachai.app` (initially `https://vekslera.github.io/tanya-chai-demo/`)

---

## 1. Purpose

A short, polished, clickable demo of the **Matmid** path (the daily portion of Tanya with short ביאור and questions) and of **Avos uBanim** (לימוד אבות ובנים: a father learning the same portion with his son). It is shown from a smartphone to leaders of organizations and institutions, including organizations that run Avos uBanim learning, and linked from slide 7 of the presentation deck (QR code).

The message of the whole project is **chayus in learning and understanding** of Tanya, for all ages. Memorization is a secondary path, so the demo does not lead with it.

The demo has to make four things felt within a few minutes:

1. **Learning at your own level.** The same portion can be studied as the text alone or with a short ביאור, and the questions change with the level. Deeper study with classical commentaries belongs to the Maskil path and is only pointed to in the demo.
2. **Immediate, warm feedback.** Each answer points back to the sentence in the text it relies on.
3. **A living sense of progress.** At the end come a streak, the gold heart contour of the logo advancing, and a counter of the learning completed together by the community.
4. **Avos uBanim.** A father gets ready-made tools for learning the portion with his son: a ביאור for the father, suggested words for explaining each thought to a child, a question for the conversation, and simple questions the son answers. The demo does not rely on the father's own skill to explain Tanya.

A taste of **Shinun** (memorization) exists behind a feature flag, off by default.

It is **not** the MVP. There are no accounts, no backend and no analytics. Everything is static and runs from local JSON.

### 1.1 Success criteria

- A first-time user can open the link on a phone and finish the whole portion, at either level, in 4–7 minutes without guidance.
- A father who has never learned Tanya with his son can follow the Avos uBanim screen without preparation.
- It looks and feels like a real product: RTL that never breaks, correct Hebrew typography, smooth transitions, no layout jumps.
- It loads fast on a mid-range Android phone over 4G (Lighthouse mobile performance ≥ 90; total transfer < 600 KB excluding fonts, < 1 MB including fonts).
- It makes zero third-party network requests, so a kosher internet filter needs to approve only one domain.
- All Torah content shown has been reviewed and approved by Alex (see §8.4).

---

## 2. Demo content

| Item | Value |
| --- | --- |
| Portion | The first half of Likkutei Amarim, chapter 32 ("the heart of the Tanya": אהבת ישראל), as learned on ט׳ אדר in a regular year: units `LA.32.001`–`LA.32.019`, three paragraphs. It opens with the chapter's main point and ends with the reason it is "כל התורה כולה". |
| Label in UI | `שיעור לדוגמה: ט׳ אדר` |
| Calendar | Regular year, chosen for the narrative: it is a demo, so the year does not need to match the current one (5787 is a leap year). |
| Start | `וְהִנֵּה, עַל יְדֵי קִיּוּם הַדְּבָרִים הַנִּזְכָּרִים לְעֵיל` (beginning of chapter 32, unit `LA.32.001`) |
| End | `וּכְמוֹ שֶׁנִּתְבָּאֵר בְּמָקוֹם אַחֵר בַּאֲרִיכוּת:` (end of the third paragraph, unit `LA.32.019`). Confirmed by Alex; see `data/schedules/daily.json`, `regular["adar-09"]`. |
| Hebrew text | `resources/texts/he/tanya/LA/32`, fetched from Sefaria (Kehot edition, §8.1): the whole chapter with nikud and punctuation, one paragraph per line, abbreviations written out. This file is the source of truth for the Hebrew. |
| English text | `resources/texts/en/tanya/LA/32`: Sefaria's English version of Tanya (Kehot translation), fetched once (§8.1), license CC-BY-NC. |
| ביאור, glossary, questions, Avos uBanim tools | Original content, drafted with AI for this demo (§8.3), reviewed by Alex and approved by a rav or a recognized educator (§8.4) |

**Approved commentaries are references for the meaning only.** Alex has approved these commentaries:

- **Lessons in Tanya (Shiurim).** Alex keeps the Hebrew for chapter 32 in `resources/texts/he/shiurim/`, excluded from Git (`.git/info/exclude`). The English is on Chabad.org.
- **Rabbi Adin Steinsaltz's commentary** on the Steinsaltz Center site, in Hebrew and English.
- **Chassidus Mevu'eres**, from Heichel Menachem.
- **The Chabad.org rendering of Tanya**, by Rabbi Tzvi Freeman.

The ביאור follows their meaning: how they understand each unit. It is written in our own words, short and simple. These commentaries are copyrighted, so they are never quoted, their sentences are never rewritten one by one, and nothing from them is committed or published. Any other commentary needs Alex's approval first.

**Content sources.** All content in Tanya Chai comes from three sources, and only from them:

1. **The raw text**, Hebrew and translation, from Sefaria, under the license recorded for each version (§8.1, §9).
2. **Chassidus books**, such as Lessons in Tanya, used only with the publisher's written permission. Until permission is given, they serve only as a local reference, as above.
3. **Level-adapted content generated with AI** (ביאור, glossary, questions, Avos uBanim tools), published only after review and approval by a rav or a recognized educator (§8.4).

---

## 3. User flow

```
Home ──► Choose level ──► Read: section ► question ► section ► … ► summary question ──► Completion
  │                                                                                      │
  │                                                                      (flag, off) Shinun taste
  ├──► Avos uBanim: card ► son's question ► card ► … ► summary question ──► Completion (shared)
  └──► About & credits
```

The questions are part of the learning, as in a story: each comes right after the section it asks about, and a summary question about the whole lesson comes after the last section.

### 3.1 Screens

#### S1: Home (`#/`)

- The animated logo symbol (`resources/brand/logo/logo-mark-animated.svg`, inlined as a React component), with the wordmark below it: תניא in navy, חי in deep gold, Frank Ruhl Libre 900. The name is always written without gershayim.
- A card reading `שיעור לדוגמה: ט׳ אדר`, with the chapter label `ליקוטי אמרים, פרק ל״ב` and the estimated time (`כ־6 דקות`).
- Status row: the streak, with a small heart-pulse icon and the text `רצף: 12 ימים` (no fire emoji). Points are not shown here.
- Primary button: `התחל ללמוד`.
- Secondary button: `לימוד אבות ובנים` (S8).
- Link: `אודות תניא חי`.
- The streak and points start from seeded demo values (streak 12, points 340) stored in `localStorage`. A reset option lives in About.

#### S2: Choose level (`#/level`)

There are two large, tappable cards, each with a one-line description:

| Level | Title | Description | Questions |
| --- | --- | --- | --- |
| 1 | `טקסט בלבד` | `קוראים את לשון התניא כפי שהיא` | 3 literal questions (what does the text say) |
| 2 | `טקסט עם ביאור` | `ביאור קצר ופשוט אחרי כל משפט` | 2 understanding questions + 1 concept question |

Below them, a quiet line, not a button: `ללימוד מעמיק עם מפרשים: מסלול משכיל, בקרוב`. The demo has no extended level: deeper study with classical commentaries belongs to Maskil.

The last choice is remembered. The default selection is level 2.

#### S3: Read (`#/read`)

- **Header:** a back arrow (pointing right, as in RTL), the portion label, the `HE`/`EN` language switch, and a thin reading-progress bar (sentences scrolled into view).
- **Body:** the text in **short sections** (`sections` in the portion file: 7 in the demo portion, the same parts as the Avos uBanim cards, S8), separated by a thin rule. Each section is split into **sentences** (§6.2), each a block with a little breathing room. Frank Ruhl Libre 400, 20–22px on phones, line-height 2.0, since the text carries nikud.
- **Level 1:** text only.
- **Level 2:** the short ביאור (1–2 lines) appears after each sentence. Rubik, smaller, muted navy, with a thin gold rule on the right edge.
- **Glossary terms:** marked with a dotted gold underline. Tapping one opens a bottom sheet with the term, a 1–3 line ביאור, and (if present) a source line. At least these terms: `נבזה ונמאס`, `נפש` / `הנפש והרוח`, `באלקים חיים`, `אחים ממש`, `אב אחד`. Final list per §8.3.
- **Language switch:** one `HE`/`EN` switch at the top of the screen, a choice for the whole lesson, kept in the state (`english`). In Hebrew mode (`HE`, the default) the screen is as above. In English mode (`EN`), each sentence's English translation comes right after its Hebrew, in exactly the same portions (LTR, `lang` set to `translationLanguage` in `app.config.json`, serif, smaller), so the English is never far from the text it translates. On level 2, the ביאור that follows is the English ביאור (§8.3), **instead of** the Hebrew one; a sentence without an English ביאור keeps its Hebrew one. The switch is hidden when the portion has no English.
- **Sections and questions:** the screen shows the sections read so far. After a section comes its question (S4), in a card under the text; once it is answered, `להמשך הלימוד` opens the next section, scrolled into view. After the last section comes the summary question, and then `לסיום השיעור` leads to the completion screen (S5). The progress bar shows the questions answered.
- **Bottom bar:** sticky, with the dedication.
- **Dedication:** when the portion has a `dedication`, a short line under the button, centered: small (15px, `--fs-dedication`) but clearly visible, in navy, medium weight, on a light gold band (`--gold-soft`). It appears on the reading screens of every learning path (S3 and the S8 cards), not on the finish screen. Its wording comes from `src/strings/he.ts` by kind: `הלימוד היומי מוקדש לעילוי נשמת …` (`leiluiNishmas`), `הלימוד היומי מוקדש לזכות …` (`lizchus`), or `השותף שלך בלימוד היומי: …` (`partner`).

#### S4: Questions (on the reading screen, S3)

- Each level has its own questions, on the same sections: one after each section but the last, and a summary question (`summary: true`) after the last (7 in the demo portion: 6 + 1). A question follows the section that holds its `unitRef`. The card shows `שאלה 3 מתוך 7`, or `שאלת סיכום`.
- **Question types:**
  - `choice`: 3–4 options. Options are shuffled per session, except options marked `fixedOrder`.
  - `trueFalse`: `נכון` / `לא נכון`.
  - `findSentence`: "tap the sentence in the text that says …". Three consecutive sentences already read are shown in compact form, the right one among them, and the user taps a sentence. Where the right one falls among the three changes from session to session; the number of sentences is `quiz.findSentence.choices` in `app.config.json`.
- **Feedback** appears immediately after answering:
  - **Correct:** the option turns gold, a short positive line appears (`יפה מאוד` / `בדיוק` and similar, rotating), plus the explanation, and the source sentence from the text is shown in a quote card with a gold highlight.
  - **Wrong (first attempt):** a gentle shake (none under reduced motion) and a hint line. The relevant sentence is highlighted, and the user may try once more.
  - **Wrong (second attempt):** the correct answer is revealed, with its explanation and the highlighted sentence.
- **Points:** 10 for a correct first attempt, 5 for a correct second attempt, 0 otherwise.
- **Language:** the questions follow the lesson's language (S3). In English mode the whole question card is in English (LTR): the question's English texts (`translations.en`: prompt, options, hint and explanation), the card's own strings (`src/strings/en.ts`), and the cited sentences of the Tanya in the English translation, both in the quote card and as the `findSentence` choices. When a question or its explanation quotes the Tanya, it quotes the English translation word for word. Every Matmid question has its English (`contentRules.questions.translatedTracks`), and each language is approved on its own (`prompt.en`, `hint.en`, `explanation.en` in the review document). Avos uBanim is in Hebrew only for now.

#### S5: Completion (`#/done`)

- A headline such as `סיימת את שיעור היום!` (the exact wording is reviewed with the other strings).
- **Streak:** 12 becomes 13, with a small pulse. The streak and the heart are the main elements of this screen.
- **Points earned:** a modest count-up line, plus a 20-point completion bonus.
- **Learning together, as a community:** a line such as `כל הלומדים יחד השבוע: 12,480 שיעורים`, with a small `נתון להדגמה` label, since the number is invented for the demo. There is no personal leaderboard.
- **The heart:** the logo symbol at large size. The gold contour animates from the previous progress value to the new one (seeded 62% → 65%; the demo step is exaggerated so it is visible). After the contour finishes, the left chamber briefly warms toward `#F3DDA2` and back: the "purify" effect from the animated logo.
- A short line explaining the heart: `הקו המוזהב מקיף את הלב ככל שמתקדמים בלימוד`.
- **Streak rule note** (small, under the streak): `הרצף נשמר בשבת ובחג, ואת השיעור משלימים במוצאי שבת`.
- **Buttons:**
  - `נסה רמה אחרת`, which goes back to S2 (points are not awarded twice for the same level).
  - `לימוד אבות ובנים`, which opens S8.
  - `טעימה משינון` (only if the Shinun flag is on).
  - `אודות`.

#### S6: Shinun taste (`#/shinun`, feature flag `VITE_FEATURE_SHINUN`, default off)

Memorization is a secondary path, so this screen is built last and stays hidden unless the flag is turned on.

- Shows a single short sentence, chosen in content as `shinun.unitId`.
- **Round 0:** the full sentence, read aloud by the user (the screen says `קראו בקול`).
- **Rounds 1–3:** progressively more words are hidden (about ⅓, about ⅔, then all but the first letter of each word). Hidden words show as soft navy-tint pills. Tapping a pill reveals that word.
- After each round the user marks `הצלחתי` or `עוד פעם`.
- At the end comes a short note that the full Shinun path works mainly by audio, over a kosher phone line, for schools.
- No microphone and no recording.

#### S7: About & credits (`#/about`)

- **What is Tanya Chai:** 3–4 short lines.
- **The paths, one line each:** מתמיד, לימוד אבות ובנים, משכיל, and שינון as a secondary path. Organizational or business models are not named.
- **Sources and credits:** the Hebrew text from Sefaria; the English translation with the exact attribution line required by its license (from the API metadata, §8.1); the ביאור and questions written for Tanya Chai.
- `התחל מחדש`: resets all local demo state.
- A contact line placeholder: `[TO FILL BY ALEX]`.
- Version and build date (from the build).

#### S8: Avos uBanim (`#/together`)

A father learns the portion with his son on one device. The screen gives the father everything to say, so the session does not depend on the father's own skill in explaining Tanya.

- **Language switch:** the `HE`/`EN` switch of S3 is shown dimmed in the header (intro, cards and questions); pressing it shows `בקרוב` for a moment (`motion.comingSoonMs`). Avos uBanim is in Hebrew only for now.
- **Intro card:** the title `לימוד אבות ובנים`, and one line: `האב קורא, מסביר ושואל, והילד עונה. כל מה שצריך לומר כתוב כאן.` A button `מתחילים`.
- **One thought per card:** 6–8 cards for the portion, one per section of the portion (S3): the card at each position covers the section at that position. Moving forward with `הבא` and back with `הקודם`. Each card shows:
  - the Tanya words of that thought, large;
  - `לאבא`: a short ביאור for the father (1–2 lines);
  - `לומר לילד`: ready-made words the father can read aloud as they are, in simple Hebrew (1–3 short sentences), in a warm gold-tinted card;
  - `שאלה לשיחה`: on some cards only, an open question for the conversation. It is not scored.
- The glossary terms work here too.
- The day's dedication (S3) appears under the `הקודם` / `הבא` buttons of each card.
- **After each card:** its son's question (S9), when the father taps `הבא`. After the last card comes the son's summary question, and then the shared completion (S5).
- Large text and large buttons: the phone is passed between father and son, often in a noisy place, such as a full beis midrash. Nothing depends on sound.
- No names or other personal details are entered.

#### S9: The son's questions (in S8)

- One simple question after each card but the last, and a summary question after the last (7 in the demo portion), with 2–3 answer options each and large buttons. The screen is headed `עכשיו תורו של הילד` (`שאלת סיכום לילד` for the summary), with a link back to the card; after the answer, `למחשבה הבאה`.
- Gentle feedback: a correct answer turns gold with a short warm line. After a wrong answer there is no red: the line `ננסה שוב?` appears, with the sentence from the text and the words the father said about it. The son may try again.
- The son sees points (`+10`); children may see points and ranks, unlike the adult screens.
- **Completion (shared):** the same completion screen (S5), worded for both: `סיימתם את השיעור יחד!`, a family streak (`רצף משפחתי`), the heart advancing, and the community counter.

### 3.2 Global UI rules

- `<html lang="he" dir="rtl">`. English blocks get `dir="ltr" lang="en"`. Never mix directions inside one text node. When Hebrew and Latin text (numbers, `EN`) sit in one line, wrap the embedded run in `<bdi>`.
- Mobile first, designed for 360–430px width. On larger screens the layout is a single centered column with a max width of 680px.
- **Navigation:** hash-based (`#/read`) so GitHub Pages needs no SPA fallback. The browser back button works.
- **State:** the current level, progress and answers survive a reload. They are kept in `localStorage`, with every access wrapped in try/catch; the demo works without storage.
- **No chat:** no chat or free text between users, and no direct conversation with an AI model. The app never calls an AI model at runtime; AI is used only offline, to draft content before review, so the learner sees only approved content.
- **No external requests:** no Google Fonts, CDNs, embeds or analytics. Fonts are self-hosted.
- **Motion:** all animation respects `prefers-reduced-motion: reduce`, replacing motion with instant state changes.
- **Accessibility:** visible focus rings (gold), tap targets ≥ 44px, contrast AA, `aria-live="polite"` for feedback text, and buttons that are real `<button>` elements.

---

## 4. Visual design

### 4.1 Tokens (CSS custom properties in `src/styles/tokens.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--navy` | `#1E2A5A` | Text, headings, תניא |
| `--gold` | `#E8A317` | Accents, the right chamber, contour, primary buttons |
| `--gold-deep` | `#B47A00` | Gold text on light backgrounds, חי |
| `--tint` | `#C9CEDB` | Left chamber, hidden-word pills, subtle fills |
| `--track` | `#EEECE6` | Contour track, dividers |
| `--bg` | `#FBFAF6` | Page background |
| `--bg-alt` | `#F3F0E7` | Cards, bottom sheets |
| `--purify` | `#F3DDA2` | Left chamber warm state |
| `--success` | use `--gold` | Correct answers are gold, not green |
| `--error` | `#B4463C` | Used sparingly; the wrong-answer state is mostly expressed by the hint and highlight |

The contrast of `--gold` on `--bg` is too low for body text, so use `--gold-deep` for gold text. Primary buttons are `--navy` background with white text, or `--gold` background with `--navy` text.

### 4.2 Typography

- **Frank Ruhl Libre:** Tanya text, headings, the wordmark. Weights 400, 700 and 900.
- **Rubik:** UI, ביאור, buttons. Weights 400, 500 and 700.
- Self-host both via `@fontsource/frank-ruhl-libre` and `@fontsource/rubik`, importing only the Hebrew and Latin subsets and only the weights listed.
- **Scale (phones):** Tanya text 21px; ביאור 16px; UI 15–16px; the dedication 15px; screen titles 24px; completion headline 28px.

### 4.3 Logo

The logo source files are in `resources/brand/logo/`, and `resources/brand/logo/README.md` describes them. Build a `<HeartMark progress={0..100} animated? beating? purify? size? />` React component that renders the same path data:

- The contour is `stroke-dasharray={`${progress} 100`}` on a path with `pathLength="100"`.
- The transition between values uses CSS `transition: stroke-dasharray 1.2s ease-in-out`. If that is not smooth on Safari, animate the dashoffset instead.
- Use `resources/brand/logo/favicon.svg` as the favicon, copied to `public/`.
- Do not redraw or "improve" the logo. Its geometry is final.

### 4.4 Tone of interface text

- Hebrew of the Chabad world: ביאור (not הסבר), שיעור, לימוד, משפט.
- Warm and respectful. No slang, no exclamation overload, no childish phrasing on the adult screens; the child's screens (S9) are simple, but never babyish.
- Words of learning, not of games: לימוד, רצף, סיום, התקדמות. The interface never calls the study a game (`משחק`), and does not use "levels lost" or similar game terms.
- Gender-neutral plural forms are preferred for instructions (`קראו`, `בחרו`).
- All UI strings live in `src/strings/he.ts`, so they can be reviewed in one place and an English UI can be added later.

---

## 5. Technical architecture

### 5.1 Stack

- **Vite + React 18 + TypeScript** (strict).
- **Styling:** plain CSS with custom properties (one CSS file per component or CSS modules). No CSS framework.
- **No state library:** use a `useReducer` app store plus context.
- **Lint and format:** ESLint (typescript-eslint, react-hooks) and Prettier.
- **Tests:** Vitest with jsdom and Testing Library, covering all the code (§5.4); Playwright smoke test (optional, milestone M7).
- **Node:** 22.18 or later, which runs the TypeScript scripts directly.

### 5.2 Folder layout

```
tanya-chai-demo/
├─ SPEC.md                    ← this file
├─ CLAUDE.md                  ← working rules for Claude Code
├─ README.md
├─ LICENSE                    ← Apache-2.0 (code)
├─ texts.config.json          ← the only place that names the texts and every file the code reads
├─ app.config.json            ← the only place for the app's parameters (§5.4)
├─ virtual.vite.ts            ← serves virtual:texts, virtual:app-config and virtual:brand
├─ resources/                 ← source material; texts change only through fetch-sefaria (§8.1)
│  ├─ brand/logo/             ← source logo files; HeartMark draws their paths (virtual:brand)
│  └─ texts/
│     ├─ he/tanya/LA/32       ← Hebrew, with nikud, one paragraph per line (+ 32.sefaria.json)
│     └─ en/tanya/LA/32       ← English, footnote marks [n], footnotes at the end (+ 32.sefaria.json)
├─ public/
│  └─ favicon.svg
├─ data/                      ← the text layer (§6.1–6.4)
│  ├─ splits/{he,en}/LA/32.json   ← hand-maintained: where each unit starts, in each language
│  ├─ units/{he,en}/LA/32.json    ← GENERATED by scripts/build-units.ts; never edited, not committed
│  ├─ translations/en/LA/32.json  ← English, as spans over unit ranges
│  └─ schedules/daily.json        ← dates → unit ranges, per year type
├─ content/                   ← the learning layer, keyed by unit ID (§6.5)
│  ├─ LA/32.json                  ← ביאור and glossary marks, per unit
│  ├─ glossary.json               ← glossary entries
│  ├─ portions/adar-09.json       ← the demo portion: date key, label, questions, Avos uBanim cards
│  ├─ REVIEW.md                   ← generated for Alex's review (§8.4)
│  └─ CONTENT-LICENSE.md          ← terms for the texts (§9)
├─ scripts/                   ← TypeScript, run by Node; each a thin entry over scripts/lib/
│  ├─ fetch-sefaria.ts        ← downloads the Hebrew and English once (§8.1)
│  ├─ build-units.ts          ← raw text + splits → units (§8.2); runs before dev, build and tests
│  ├─ build-translations.ts   ← English resource → translation spans
│  ├─ resolve-matches.ts      ← glossary matches written without nikud → exact text
│  ├─ build-review.ts         ← content/REVIEW.md (§8.4)
│  ├─ check-overlap.ts        ← overlap check against the local Shiurim (§8.3)
│  ├─ validate-content.ts     ← schema and integrity checks (§6.5, §8.4)
│  ├─ lib/                    ← config, env (ports), load, validate/, review/, text libraries
│  └─ test/                   ← in-memory script environment for the tests
├─ src/
│  ├─ main.tsx                ← entry: createDeps(browserAdapters())
│  ├─ composition.ts          ← the one place that chooses the sources and the storage
│  ├─ App.tsx, Screens.tsx    ← providers; route → screen
│  ├─ config.ts               ← app.config.json, typed (served as virtual:app-config)
│  ├─ ports.ts                ← TextSource, LearningContentSource, KeyValueStorage
│  ├─ routes.ts, router.ts    ← every route named once; hash routing
│  ├─ domain/                 ← pure logic: no React, no DOM (shared with the scripts)
│  ├─ adapters/               ← bundledSources (virtual:texts), browserStorage, memoryStorage
│  ├─ content/                ← loadPortion (through the ports), PortionProvider
│  ├─ store/                  ← state and reducer, persistence, StoreProvider, useStartQuiz
│  ├─ hooks/                  ← one hook per file (timeline, count-up, seen units, …)
│  ├─ components/             ← HeartMark, Sentence, BottomSheet, GlossarySheet, …
│  ├─ screens/<screen>/       ← one folder per screen, split into small views
│  ├─ strings/he.ts
│  ├─ styles/                 ← tokens.css (design parameters), base.css, fonts.css
│  └─ test/                   ← fixtures and renderApp for the tests
└─ .github/workflows/deploy.yml
```

### 5.3 State (persisted under one storage key, `storage.key` in `app.config.json`)

The build at the site's root uses the key as it is; the `dev` build under `/dev/` adds its path (`tanyachai.demo.v1@/dev/`), so the two builds on one domain never share their state (§10).

```ts
type DemoState = {
  level: number;                  // one of the levels in app.config.json
  streak: number;                 // seeded from demo.initialProgress
  points: number;                 // seeded from demo.initialProgress
  heartProgress: number;          // seeded from demo.initialProgress, 0..scoring.heartMax
  completedLevels: number[];      // prevents double awarding
  completedTogether: boolean;     // Avos uBanim done once (awards like a level)
  familyStreak: number;           // seeded from demo.initialProgress; shown only in the Avos uBanim completion
  togetherIndex: number;          // current card in S8
  quiz: { track: "solo" | "together"; questionIds: string[]; index: number; attempts: Record<string, number>; earned: number } | null;
  english: boolean;               // the lesson is read with its English (S3)
  seenShinun: boolean;
  lastCompletion: Completion | null; // what the completion screen shows and animates
};
```

**Rules:**

- Completing a level, or Avos uBanim, for the first time awards the points and the completion bonus, increments the streak once per session (not per level), and advances `heartProgress` by `scoring.heartStep`, capped at `scoring.heartMax`. Completing Avos uBanim also increments `familyStreak`. The demo's values: 10 and 5 points for a correct answer on the first and second attempt, a bonus of 20, and a step of 3 up to 100.
- The streak is a demo value. The Shabbos rule is displayed but not computed.

### 5.4 Architecture and code rules

The demo is the first step toward the full app. Its code follows four rules.

1. **No hardcoded parameters.** Each parameter is defined once, and changing it there changes it everywhere:
   - `app.config.json`: the app's behavior (storage key, levels, demo values, scoring, attempts, timings, number format) and the content rules the validator checks (§6.5). The app reads it through `src/config.ts` (served as `virtual:app-config`), the scripts through `scripts/lib/config.ts`.
   - `texts.config.json`: the chapters, every file path the code reads, and the Sefaria refs and versions.
   - `src/styles/tokens.css`: colors, type, spacing and sizes. A value both the CSS and the code need (the heart's contour duration) comes from `app.config.json` and reaches the CSS as a custom property.
   - `src/strings/he.ts`: every UI string. `src/routes.ts`: every route.
   - The logo file: the heart's paths, read at build time (`virtual:brand`).
2. **Single responsibility and dependency inversion.**
   - `src/domain/` holds the pure logic: units and ranges, portion assembly, the quiz and its session, scoring and progress, the segmenting of text (glossary terms, footnote marks, Latin runs), the completion timeline. It has no React and no DOM, takes its rules as parameters, and is shared with the scripts.
   - The app depends on the interfaces in `src/ports.ts`, never on where its data comes from. The bundled files and `localStorage` are adapters (`src/adapters/`), chosen in one place, `src/composition.ts`. Taking the text from the Sefaria API means writing a `TextSource` adapter and changing that one file.
   - The scripts work the same way: each takes a `ScriptEnv` (files, log, network, clock), so its logic runs the same on disk and in the tests.
   - Screens are composed of small views; each hook has its own file.
3. **Small files.** Code files stay small to moderate; most are well under 100 lines. Separation of responsibilities comes first.
4. **Tests cover all the code.** `npm run coverage` requires 100% of lines and branches in `src/`, `scripts/` and the Vite plugin, and runs in CI. Screens are tested through the real app over in-memory adapters.

---

## 6. Content model

The Tanya text is stored **once**, untouched, in `resources/`. Everything else (the daily schedule, the English, the ביאור, the questions) points into it through **unit IDs**. A daily portion is never a copy of the text; it is a range of units, assembled at runtime. This is the same idea as the printed daily-Tanya markers in Hayom Yom: the book is printed once, and the division into days marks where each day starts.

All files are JSON, validated against the TypeScript types below (`src/domain/types.ts`) and by `scripts/validate-content.ts`.

### 6.1 Unit IDs

- A **unit** is the smallest piece of text anything refers to: usually a sentence or clause, split finer only where a daily portion or another layer needs a boundary.
- **ID format:** `<part>.<chapter>.<seq>`, with the part code `LA` (Likkutei Amarim), the chapter number, and a three-digit sequence: `LA.32.001`.
- **IDs are permanent.** Never renumber. To split a unit later, keep its ID on the first piece and add letters: `LA.32.007` becomes `LA.32.007a` and `LA.32.007b`. Do not reuse a deleted ID.
- A unit never crosses a paragraph (a line of the raw file).

### 6.2 Splits (hand-maintained) and units (generated)

`data/splits/he/LA/32.json` is the only place where units are defined. Each entry gives the unit's ID and the words it starts with, copied from the raw text **without nikud** (2–4 words are enough):

```ts
type Split = {
  id: UnitId;            // "LA.32.004"
  startsWith: string;    // "כי מאחר שגופו נמאס" — the raw file's words, unvocalized
  continues?: true;      // this unit carries on the previous unit's sentence
};
// data/splits/he/LA/32.json: Split[] in reading order
```

**Sentences.** The units follow the division of the Hebrew Shiurim (Lessons in Tanya), which sometimes cuts one sentence of the Tanya into two units: `בשגם שכולן מתאימות` / `ואב אחד לכולנה`. The unit IDs stay as they are; a sentence is annotated on top of them, by `continues: true` on each unit after the sentence's first. A sentence stays within its paragraph. The app shows the text sentence by sentence: one ביאור per sentence, after the whole sentence, and the sentence questions offer whole sentences. A sentence's ביאור is kept on its first unit, and its ID is its first unit's ID. The sentences are the Hebrew's: the other languages share the unit IDs and are joined the same way. In chapter 32, units 001–019 form 11 sentences: 001–002, 003, 004–005, 006–007, 008, 009–010, 011–012, 013, 014–015, 016–017, 018–019.

**Other languages.** The same units are anchored in each other language's text, so that language can be read unit by unit too. `data/splits/en/LA/32.json` gives, for each Hebrew unit ID, in the same order, the words its English starts with. The validator checks that the IDs match the Hebrew. Matching works the same way, on letters only: in English, case, punctuation, quotes and footnote numbers are ignored, and an em dash counts as a space, as the maqaf does in Hebrew. The languages are the keys of `paths.splits` in `texts.config.json`; the app's own language is `language` in `app.config.json`.

`scripts/build-units.ts` reads the raw file and the splits of each language and writes `data/units/he/LA/32.json` and `data/units/en/LA/32.json`:

```ts
type Unit = {
  id: UnitId;
  seq: number;           // position in the whole book, for range queries
  part: "LA";
  chapter: number;
  paragraph: number;     // 1-based line of the raw file
  text: string;          // exact text from the anchor up to the next anchor or the end of the line
  sentence?: UnitId;     // on a unit that continues a sentence: the sentence's first unit
};
```

**Matching.** Anchors are compared on Hebrew letters only: nikud, cantillation, punctuation and repeated spaces are ignored on both sides, and a maqaf counts as a space. Each anchor is searched from the end of the previous one, so a phrase that recurs later in the chapter is not a problem. A unit starts at the beginning of the word its anchor matches, including punctuation attached to it (such as `[` or `״`), and ends where the next unit starts or at the end of the paragraph. Anchors are taken from the raw file itself, never from another edition: editions differ in spelling as well as nikud (Kehot's vocalized text writes `מתועב` where unvocalized editions write `מתעב`).

The units file is a build output: it is regenerated whenever the raw text or the splits change, it is listed in `.gitignore`, and nobody edits it. Anchors (opening words) are used instead of character positions so that a small correction in the raw text does not shift every unit after it.

### 6.3 Schedules

```ts
type DateKey = string;   // "<month>-<day>", e.g. "adar1-23", "adar-09", "kislev-19"
// month names: tishrei, cheshvan, kislev, teves, shvat, adar, adar1, adar2, nissan, iyar, sivan, tammuz, av, elul
type Range = { from: UnitId; to: UnitId };   // inclusive
type DailySchedule = {
  source: string;                        // where the division was taken from (e.g. Hayom Yom)
  regular: Record<DateKey, Range[]>;     // a list, since a day may cover more than one stretch
  leap: Record<DateKey, Range[]>;
};
// data/schedules/daily.json
```

The file already holds chapter 32 for both year types, as given by Alex: in a regular year 9–10 Adar, in a leap year 23–28 Adar I. Every portion starts at a unit boundary. Before the product covers a whole year, check in Hayom Yom how the division handles years with a 29-day Cheshvan or Kislev; the format allows adding more year-type keys if needed.

### 6.4 Translations

```ts
type TranslationSpan = {
  from: UnitId; to: UnitId;              // the Hebrew unit this English covers (from = to)
  text: string;                          // verbatim from the English source: the unit's English
  footnotes?: Record<string, string>;    // the footnotes its text marks, "[n]"
  sourceId: "en-resource" | "sefaria-en";
  sourceSegments?: number[];             // Sefaria English segment numbers used (§8.1)
};
// data/translations/en/LA/32.json: TranslationSpan[] in order
```

`npm run build-translations` makes one span per unit, from the English units (`data/splits/en/`, §6.2), with the footnotes each marks. In English mode (S3), each span is shown under the sentence it starts in, so each sentence gets the English of its own units.

### 6.5 Learning content (keyed by unit ID)

```ts
type UnitContent = {
  id: UnitId;
  biur?: Record<string, { short?: Reviewed<string> }>;  // by language: "he", "en"; one level in the demo (§3.1, S2)
  glossary?: { entryId: string; match: string }[];   // exact substring of the unit's text to underline
};
// content/LA/32.json: UnitContent[]

type GlossaryEntry = { id: string; term: string; body: Reviewed<string> };
// content/glossary.json: GlossaryEntry[]

type TogetherCard = {                  // Avos uBanim (S8): one thought, on the section at its position
  id: string;
  forParent: Reviewed<string>;         // short ביאור for the father
  toChild: Reviewed<string>;           // words the father reads aloud to his son
  talk?: Reviewed<string>;             // open question for the conversation, unscored
};

type Portion = {                       // content/portions/adar-09.json
  dateKey: "adar-09";
  yearType: "regular";
  label: { he: "שיעור לדוגמה: ט׳ אדר"; en: "Sample lesson: 9 Adar" };
  location: { he: "ליקוטי אמרים, פרק ל״ב"; en: "Likkutei Amarim, chapter 32" };
  boundariesConfirmed: boolean;        // false until Alex confirms the daily division
  sections: { from: UnitId; to: UnitId }[]; // the short sections, in order: they cover the portion
                                       // exactly once, each starting a sentence (S3, S8)
  sources: Source[];                   // see §8.1
  questions: Question[];
  together: TogetherCard[];            // 6–8 cards, one per section, in order
  shinun?: { unitId: UnitId; rounds: number[][] }; // word indices hidden per round
  dedication?: { kind: "leiluiNishmas" | "lizchus" | "partner"; name: string }; // S3, S8
};

type Source = {
  id: "he-resource" | "en-resource" | "sefaria-en";
  path?: string;            // for resources: the file path in the repo
  ref?: string;             // for Sefaria: the exact ref used
  versionTitle?: string;
  license: string;          // as recorded in SOURCE.md, or copied verbatim from the API response
  attribution: string;      // the exact line shown in About
  url?: string;
};

type Question = {
  id: string;
  track: "solo" | "together";  // together = the son's questions (S9)
  level?: 1 | 2;               // solo track only
  kind: "choice" | "trueFalse" | "findSentence";
  category: "literal" | "understanding" | "concept" | "child";
  prompt: Reviewed<string>;
  options?: { id: string; text: string }[];   // choice
  answer: string;                             // option id, "true"/"false", or a unit ID
  unitRef: UnitId;                            // unit the answer relies on (highlighted in feedback)
  hint: Reviewed<string>;
  explanation: Reviewed<string>;
  fixedOrder?: boolean;
  summary?: true;                             // asked after the last section, about the whole lesson
  translations?: Record<string, {             // by language, e.g. "en": the question in English mode (S4)
    prompt: Reviewed<string>;
    options?: { id: string; text: string }[]; // the same option IDs, in the same order
    hint: Reviewed<string>;
    explanation: Reviewed<string>;
  }>;
};

type Reviewed<T> = { value: T; reviewed: boolean; note?: string };
```

**Assembling a portion** (`src/domain/portion.ts`, loaded through the ports by `src/content/loadPortion.ts`): read the portion's `dateKey` and `yearType`, look up its ranges in the schedule, take the units from the `seq` of `from` to the `seq` of `to`, group them by paragraph, attach the translation spans and the unit content, and hand the result to the screens. All of this happens at build time or on load; there is no server.

**Integrity rules** (enforced by the validator, and run in CI). The numbers below are the demo's values of `contentRules` in `app.config.json`, where they are defined:

- Every `startsWith` anchor is found, letters only and in order (§6.2), and the first unit of each paragraph starts at the beginning of its line.
- The units of each paragraph, joined, equal that line of the raw file exactly (apart from trailing whitespace and line endings). In other words, the text is never edited, only split.
- Unit IDs are unique, follow the format of §6.1, and are never missing from a range they fall in.
- Every `Range`, `TranslationSpan`, `unitRef`, unit-ID answer and `UnitContent.id` refers to existing units, with `from` not after `to`.
- The translation spans of a chapter cover each of its units exactly once.
- Every `glossary.match` occurs in its unit's text. Every `entryId` exists.
- In each level of the solo track, and in the together track: `contentRules.questions.perSection` (1) questions after each section but the last, by the section of their `unitRef`, none after the last, and exactly one `summary` question. Level 1 questions are `literal`; level 2 questions are `understanding` or `concept` (`levelCategories`). Every question of the tracks in `translatedTracks` (the solo track) has its texts in `translationLanguage`, with all three fields and the same options.
- The sections cover the portion's units exactly once, in order, each from a sentence's start. There are 6–8 Avos uBanim cards, one per section. The together track's questions are all `category: "child"`, `kind` `choice` or `trueFalse`, with 2–3 options.
- Every solo `choice` question has exactly one correct option and 3–4 options in total.
- The validator prints a **summary of unreviewed items**. It fails the build only when `CONTENT_STRICT=1` is set. The deploy validates `main` with `CONTENT_STRICT=1`, and `dev` without it (§10).

---

## 7. Behavior details

- **Unit splitting:** split at the natural sentence and clause boundaries of the Tanya text (periods, `כי`, `ולכן`, `והנה`, etc.). Aim for 1–3 lines per unit on a phone. Splitting is defined by hand in the splits file (§6.2), never at runtime. A screen "sentence" is one sentence of §6.2: one unit, or consecutive units joined by `continues`.
- **Glossary underline:** rendered by splitting the unit's text at `match`. If a match appears twice, underline only the first occurrence.
- **Shuffling:** seeded per session, so a reload does not reorder a question the user is looking at.
- **Reading progress:** an IntersectionObserver per unit.
- **Text display:** show the Hebrew exactly as in the resource file, with its nikud, punctuation and written-out abbreviations. (The "no gershayim" rule applies only to the name חי.) Strip HTML tags from Sefaria's English, but keep its words exactly.
- **Matching with nikud:** glossary matches and hidden-word logic work on the vocalized text as it is. Do not strip nikud for display or for matching.
- **Errors:** if content fails to load, show a calm full-screen message with a retry button. In practice the content is bundled, so this should not happen.

---

## 8. Content pipeline

### 8.1 The texts

**Hebrew.** Read `resources/texts/he/tanya/LA/32`. Each line is one paragraph. Never change this file by hand. Its source and terms are recorded in `resources/texts/he/SOURCE.md`: Kehot's vocalized edition, digitized by Sefaria, CC-BY-NC.

**English.** `resources/texts/en/tanya/LA/32`, with its source and terms in `resources/texts/en/SOURCE.md`.

Both files are written by `scripts/fetch-sefaria.ts` (`npm run fetch-sefaria`), once, on Alex's machine. All file paths, refs and expected versions are in `texts.config.json`. For each language the script does the following:

1. Find the exact ref for Likkutei Amarim chapter 32 on Sefaria. Open the chapter on sefaria.org and copy the ref from the URL. It is expected to be similar to `Tanya, Part I; Likkutei Amarim 32`.
2. Call the v3 texts API for the version. For example:
   `https://www.sefaria.org/api/v3/texts/<url-encoded ref>?version=english|<versionTitle>`
3. Save the **full, unmodified response** next to the text file (`32.sefaria.json`), together with the fetch date.
4. Print the version's `versionTitle`, `license` and `versionSource`.
5. **Stop and report to Alex**, writing nothing, in either case:
   - the license is not public domain, CC0, CC-BY or CC-BY-NC;
   - the version is anything other than the Kehot edition of the Tanya text itself, or its Kehot translation (for example, a commentary).
6. Write the plain text file: one paragraph per segment, HTML removed and the words kept exactly. In the English, each footnote becomes a mark `[n]` where it applies, and the footnotes follow after a blank line as `[n] text`.

The Hebrew segments also carry the daily-portion markers (`[פ: ט אדר]` for a regular year, `[מ: …]` for a leap year); the script prints them so the schedule can be checked against them.

**Alignment.** Sefaria's English segments may not match the lines of the Hebrew file. Write one translation span per Hebrew paragraph (§6.4), joining or dividing English segments only at sentence boundaries, and record the segments used in `sourceSegments`. If a paragraph cannot be matched cleanly, ask Alex.

Runtime code never calls Sefaria. The app only reads the files in `data/` and `content/`, which are bundled at build time.

### 8.2 Building the text layer

Claude Code prepares, for chapter 32:

1. **Splits:** `data/splits/he/LA/32.json` already exists: 48 units for the whole chapter, prepared by Alex and Claude (§6.1, §7), and `data/splits/en/LA/32.json` anchors the same units in the English (§6.2). Do not change the existing IDs. The text itself is never changed.
2. **Units:** `scripts/build-units.ts` generates `data/units/he/LA/32.json` and `data/units/en/LA/32.json`. It runs as the `predev`, `prebuild`, `pretest` and `precoverage` steps in `package.json`, so the units are always fresh.
3. **Translations:** `data/translations/en/LA/32.json`, one span per unit, verbatim from the English source.
4. **Schedule:** `data/schedules/daily.json` already exists; do not change it. If a future portion boundary falls inside a unit, split that unit (§6.1).
5. **Portion:** `content/portions/adar-09.json` with the date key, label, sources, questions and Avos uBanim cards.

### 8.3 Writing the ביאור, glossary, questions and Avos uBanim tools

These are drafted by Claude (in the claude.ai conversation or in Claude Code) and **every item starts with `reviewed: false`**.

**Guidelines for the drafter:**

- Stay strictly within the plain meaning of the text, as it is learned in Chabad. No novel interpretations, no stories, no attributions to the Rebbe or other sources unless Alex supplies them.
- The ביאור follows the meaning of the approved commentaries (§2), so it carries the inner, Chassidic point of each unit and not only its literal sense. It is written in our own words with our own examples. **Never** quote a commentary or rewrite its sentences one by one.
- **Overlap check:** before review, a script compares every draft item with the local Shiurim file and flags any run of 5 or more words in common (letters only, nikud ignored). Flagged items are rewritten. The check runs only where the file exists, that is on Alex's machine, never in CI. The English ביאור is checked the same way against the English commentaries it follows.
- **Short ביאור:** written in each language (Hebrew and English), at most 25 words per unit in Hebrew and 35 in English (`contentRules.biurMaxWords`); a sentence of several units may have that many words for each of its units. Each language explains its own text of the sentence, with the same meaning, and is written from the commentaries in that language: the English ביאור follows Lessons in Tanya and Steinsaltz in English, and is not a translation of the Hebrew ביאור. (The English ביאור of `LA.32.001`–`LA.32.019` was carried over from the Hebrew; it is to be rewritten this way.) It explains words and the flow, so simply that a child of about 10, or someone opening Tanya for the first time, understands it. No unexplained terms. The third paragraph (`LA.32.011`–`LA.32.019`) is the hardest at this level and needs the most care. There is no extended ביאור in the demo.
- **Questions** test the text, not trivia.
  - **Literal:** what does the text say.
  - **Understanding:** why does it say so.
  - **Concept:** how does this connect to the idea of the chapter, for example why a lowly view of the body makes אהבת ישראל easy, or what "אחים ממש" means.
  - **Distractors:** plausible but clearly wrong according to the text, never tricky wording. Avoid "all of the above".
- **Avos uBanim** (written for boys of school age, about 8–12):
  - **For the father (`forParent`):** at most 30 words per card; what the thought says and why, so the father understands before explaining.
  - **To the child (`toChild`):** 1–3 short sentences, at most 35 words, that the father can read aloud as they are. Simple words and examples from a child's world (family, friends, class), always faithful to the text. No invented stories attributed to anyone.
  - **Conversation (`talk`):** on 2–3 cards only; an open question about the child's own life, with no right answer.
  - **The son's questions:** one after each card but the last, and a summary question, with 2–3 options, about the main idea, never about wording.
- **Hebrew register:** modern Hebrew that is clear and respectful, using Chabad terms.

### 8.4 Review and sign-off

1. Claude Code generates `content/REVIEW.md` from the JSON: every reviewable item in reading order, with its id. Alex can read it in one pass.
2. Alex marks corrections, either in REVIEW.md or directly in the JSON. Claude Code applies them and flips `reviewed: true` only for items Alex approved.
3. Before showing the demo publicly, all items must be `reviewed: true`. Alex's review is the first pass; an item becomes `reviewed: true` only after a rav or a recognized educator has also approved it (moderation). The deploy workflow validates `main` with `CONTENT_STRICT=1`.
4. While items are unreviewed, a small `טיוטה` badge appears in the About screen. This is development mode only, never in the strict build.

---

## 9. Licensing and attribution

- **Code:** Apache-2.0 (the existing `LICENSE`).
- **Tanya Hebrew text:** the words are public domain, but the nikud and punctuation of a modern edition may be protected. The About screen credits the edition named in `resources/texts/he/SOURCE.md`, under the terms recorded there.
- **English translation:** use the license and attribution exactly as given in the Sefaria metadata. If it is CC-BY-NC (expected), the demo is non-commercial and free, which is compatible, and the attribution line is shown in About.
- **ביאור, glossary, questions, Avos uBanim tools:** © Tanya Chai, all rights reserved. They are not covered by the Apache license.
- `content/CONTENT-LICENSE.md` states all of the above. `README.md` gets a short "Content license" section linking to it.

---

## 10. Deployment: GitHub Pages, step by step

GitHub Pages serves one site per repository, so both long-lived branches are built into one site:

| Branch | Address | Content check |
| --- | --- | --- |
| `main` (stable) | `https://demo.tanyachai.app/` | `CONTENT_STRICT=1`: every item approved |
| `dev` (current) | `https://demo.tanyachai.app/dev/` | unreviewed items allowed |

`.github/workflows/deploy.yml` runs on every push to `main` or `dev` (and by hand, from **Actions**). It checks out both branches, runs every check on each (lint, coverage, content validation), builds `main` with `VITE_BASE=/` and `dev` with `VITE_BASE=/dev/`, puts the `dev` build under `dev/` in the site, and publishes it. If either branch fails a check, nothing is published and the site stays as it was. Until `main` contains the app, the workflow publishes `dev` alone.

The two builds share one domain, so each keeps its saved state under its own storage key (§5.3).

### 10.1 Repository settings (once)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Environments → `github-pages` → Deployment branches:** add `dev` next to `main`. Without it, the runs started by a push to `dev` are refused.
3. Push to `dev` (or merge a pull request into `main`). Open **Actions** to watch the run.

### 10.2 Custom domain `demo.tanyachai.app` (Namecheap)

1. **Verify the domain on GitHub**, to prevent takeover: **profile picture → Settings → Pages → Add a domain**, enter `tanyachai.app`. GitHub shows a TXT record. In Namecheap, **Domain List → Manage → Advanced DNS → Add New Record**: type **TXT Record**, host `_github-pages-challenge-vekslera` (Namecheap adds the domain itself), value as shown. Then press **Verify** on GitHub. (If there is no Advanced DNS tab, first set **Nameservers** to **Namecheap BasicDNS**.)
2. **DNS:** in **Advanced DNS**, add a **CNAME Record**: host `demo`, value `vekslera.github.io.`, TTL Automatic.
3. **Repository:** **Settings → Pages → Custom domain**, enter `demo.tanyachai.app`, **Save**, and wait for the DNS check to pass.
4. **HTTPS:** tick **Enforce HTTPS** once it becomes available; this can take up to about an hour. The `.app` domains require HTTPS in every browser, so the site does not load until the certificate is issued. That is expected.

No `CNAME` file is needed: with a GitHub Actions deployment, the custom domain is set only in the repository settings.

### 10.3 Kosher internet filters

The demo makes no third-party requests, so only `demo.tanyachai.app` needs approval. After the custom domain is live:

- submit the site for approval to the main filtering services used by the audience (NetFree, Netspark/Rimon, and others);
- note in each submission that it is a static Torah-learning site with no external content;
- test from a filtered connection before an important meeting.

---

## 11. Milestones

Each milestone is a small, reviewable step. Work on a branch per milestone, and Alex merges to `main`.

| # | Milestone | Done when |
| --- | --- | --- |
| M0 | **Scaffold and pipeline:** Vite + React + TS, ESLint/Prettier, tokens, self-hosted fonts, `HeartMark` component, a placeholder Home screen, the deploy workflow | The placeholder page is live on the project URL, RTL is correct, and the heart renders at 62% |
| M1 | **Text layer:** splits for chapter 32, `build-units`, the English (from `resources/` or fetched with `fetch-sefaria`, license reported) as translation spans, the schedule entry, the portion file, the loader and the validator | The validator passes the integrity rules of §6.5, and Alex has confirmed the portion boundaries |
| M2 | **Content drafts:** short ביאור for the 19 units, glossary, 6 solo questions with hints and explanations, 6–8 Avos uBanim cards and 3 questions for the son, all `reviewed: false`; `REVIEW.md` generated | REVIEW.md is ready for Alex |
| M3 | **Read screen:** levels, glossary sheet, per-paragraph English, reading progress | Works on a 360px phone and on desktop; no RTL glitches |
| M4 | **Quiz:** three question types, feedback with sentence highlight, retry, points, back-to-text sheet | All 6 questions are playable, and state survives a reload |
| M5 | **Completion:** streak, heart contour animation, purify effect, community counter, points line, level replay | Smooth on a mid-range Android; reduced motion respected |
| M6 | **Avos uBanim** (S8, S9, shared completion) and the About & credits screen | A father can go through all cards and his son's questions on one phone; attribution lines are exact; reset works |
| M7 | **Polish and launch:** review fixes applied, `CONTENT_STRICT=1`, Lighthouse, custom domain, filter submissions; optional Playwright smoke test | The demo runs at `https://demo.tanyachai.app` on Alex's phone, and the QR code for slide 7 is generated |
| Optional | **Shinun taste** (S6), behind the flag, off by default | Works when the flag is on; invisible when it is off |

---

## 12. Out of scope for the demo

- Accounts, sync, a backend, analytics.
- Audio, narration, the kosher phone line.
- The teacher dashboard.
- The Maskil path.
- Payments.
- Push notifications.
- An English UI.
- Real streak computation across days and the Jewish calendar.
- Native or React Native apps.

All of these are covered in the product blueprint, not here.

---

## 13. Open items for Alex

1. Done: the portion boundaries for chapter 32 are in `data/schedules/daily.json`.
2. Done: the source of the Hebrew text is recorded in `resources/texts/he/SOURCE.md`.
3. Review all content in `content/REVIEW.md` (§8.4), including the Avos uBanim tools.
4. Fill in the contact line on the About screen.
5. Register `tanyachai.app` and set the DNS record (§10.2).
6. Review the UI strings in `src/strings/he.ts`.
