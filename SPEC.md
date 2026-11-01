# Tanya Chai (תניא חי): Demo Specification

**Version:** 1.0 (draft for build)
**Owner:** Alex Veksler
**Repository:** `vekslera/tanya-chai-demo` (public; code under Apache-2.0, content under its own terms, see §9)
**Target URL:** `https://demo.tanyachai.app` (initially `https://vekslera.github.io/tanya-chai-demo/`)

---

## 1. Purpose

A short, polished, clickable demo of the **Matmid** path (the daily portion of Tanya with short ביאור and questions). It is shown from a smartphone to leaders of organizations and institutions, and linked from slide 7 of the presentation deck (QR code).

The demo has to make three things felt within about three minutes:

1. **Learning at your own level.** The same portion can be studied as the text alone, with a short ביאור, or with an extended ביאור, and the questions change with the level.
2. **Immediate, warm feedback.** Each answer points back to the sentence in the text it relies on.
3. **A living sense of progress.** At the end come points, a streak, and the gold heart contour of the logo advancing.

Optionally, it also gives a taste of **Shinun** (memorization) through one sentence whose words gradually disappear.

It is **not** the MVP. There are no accounts, no backend and no analytics. Everything is static and runs from local JSON.

### 1.1 Success criteria

- A first-time user can open the link on a phone and finish the whole portion, at any level, in 3–6 minutes without guidance.
- It looks and feels like a real product: RTL that never breaks, correct Hebrew typography, smooth transitions, no layout jumps.
- It loads fast on a mid-range Android phone over 4G (Lighthouse mobile performance ≥ 90; total transfer < 600 KB excluding fonts, < 1 MB including fonts).
- It makes zero third-party network requests, so a kosher internet filter needs to approve only one domain.
- All Torah content shown has been reviewed and approved by Alex (see §8.4).

---

## 2. Demo content

| Item | Value |
| --- | --- |
| Portion | The opening of Likkutei Amarim, chapter 32 ("the heart of the Tanya": אהבת ישראל) |
| Label in UI | `שיעור לדוגמה: כ״ג אדר א׳` |
| Calendar | Leap year (5787 is a leap year), following the official daily Tanya division |
| Start | `והנה ע״י קיום הדברים הנ״ל` (beginning of chapter 32) |
| End | **TO CONFIRM BY ALEX** from the official daily division for כ״ג אדר א׳ (e.g. chabad.org daily Tanya). Until confirmed, use the first two Sefaria segments of chapter 32 and set `portion.boundariesConfirmed: false`. |
| Hebrew text | Sefaria (the standard Hebrew text of Tanya) |
| English text | Sefaria's English version of Tanya (Kehot translation). Check the license in the API response (§8.1). |
| ביאור, glossary, questions | Original content written for this demo (§8.3), reviewed by Alex |

**Lessons in Tanya must not appear anywhere** in this repository: not quoted, not paraphrased closely, not used as a hidden source for the ביאור. The same applies to any other copyrighted commentary.

---

## 3. User flow

```
Home ──► Choose level ──► Read ──► Questions ──► Completion
  │                        ▲  │          │
  │                        └──┘ (back to text on any question)
  └──► About & credits                    └──► (optional) Shinun taste ──► Completion
```

### 3.1 Screens

#### S1: Home (`#/`)

- The animated logo symbol (`brand/logo/logo-mark-animated.svg`, inlined as a React component), with the wordmark below it: תניא in navy, חי in deep gold, Frank Ruhl Libre 900. The name is always written without gershayim.
- A card reading `שיעור לדוגמה: כ״ג אדר א׳`, with the chapter label `ליקוטי אמרים, פרק ל״ב` and the estimated time (`כ־5 דקות`).
- Status row: streak (`🔥` is **not** used; use a small heart-pulse icon and the text `רצף: 12 ימים`) and points.
- Primary button: `התחל ללמוד`.
- Secondary link: `אודות תניא חי`.
- The streak and points start from seeded demo values (streak 12, points 340) stored in `localStorage`. A reset option lives in About.

#### S2: Choose level (`#/level`)

There are three large, tappable cards, each with a one-line description:

| Level | Title | Description | Questions |
| --- | --- | --- | --- |
| 1 | `טקסט בלבד` | `קוראים את לשון התניא כפי שהיא` | 3 literal questions (what does the text say) |
| 2 | `טקסט עם ביאור קצר` | `ביאור קצר משולב אחרי כל משפט` | 3 understanding questions |
| 3 | `טקסט עם ביאור מורחב` | `ביאור מורחב ומושגי יסוד` | 2 understanding + 1 concept question |

The last choice is remembered. The default selection is level 2.

#### S3: Read (`#/read`)

- **Header:** a back arrow (pointing right, as in RTL), the portion label, and a thin reading-progress bar (sentences scrolled into view).
- **Body:** the text, split into **sentences**, each a block with a little breathing room. Frank Ruhl Libre 400, 20–22px on phones, line-height 1.9.
- **Level 1:** text only.
- **Level 2:** the short ביאור (1–2 lines) appears after each sentence. Rubik, smaller, muted navy, with a thin gold rule on the right edge.
- **Level 3:** the extended ביאור appears as an expandable block after each sentence (`הרחבה ▾`). The first one is open by default. It may contain a short "יסוד" note explaining a concept, such as נפש האלקית or אהבת ישראל.
- **Glossary terms:** marked with a dotted gold underline. Tapping one opens a bottom sheet with the term, a 1–3 line ביאור, and (if present) a source line. At least these terms: `נבזה ונמאס`, `נפש` / `הנפש והרוח`, `באלקים חיים`, `אחים ממש`, `אב אחד`. Final list per §8.3.
- **English toggle:** each paragraph has a small `EN` chip. Tapping it reveals the English translation of that paragraph below the Hebrew (LTR, `lang="en"`, serif, smaller). The toggle is per paragraph, not global. A global "show all English" action is in the overflow menu.
- **Bottom bar:** a sticky primary button, `לשאלות` (enabled once the user has scrolled to the end, or after 20 seconds).

#### S4: Questions (`#/quiz`)

- One question per screen, with a progress dots header (●●○).
- **Question types:**
  - `choice`: 3–4 options. Options are shuffled per session, except options marked `fixedOrder`.
  - `trueFalse`: `נכון` / `לא נכון`.
  - `findSentence`: "tap the sentence in the text that says …". The text is shown in compact form and the user taps a sentence.
- **Feedback** appears immediately after answering:
  - **Correct:** the option turns gold, a short positive line appears (`יפה מאוד` / `בדיוק` and similar, rotating), plus the explanation, and the source sentence from the text is shown in a quote card with a gold highlight.
  - **Wrong (first attempt):** a gentle shake (none under reduced motion) and a hint line. The relevant sentence is highlighted, and the user may try once more.
  - **Wrong (second attempt):** the correct answer is revealed, with its explanation and the highlighted sentence.
- A `חזרה לטקסט` link opens the text in a bottom sheet scrolled to the relevant sentence, without losing the quiz state.
- **Points:** 10 for a correct first attempt, 5 for a correct second attempt, 0 otherwise.

#### S5: Completion (`#/done`)

- A headline such as `סיימת את שיעור היום!` (the exact wording is reviewed with the other strings).
- **Points earned:** a count-up animation, plus a 20-point completion bonus.
- **Streak:** 12 becomes 13, with a small pulse.
- **The heart:** the logo symbol at large size. The gold contour animates from the previous progress value to the new one (seeded 62% → 65%; the demo step is exaggerated so it is visible). After the contour finishes, the left chamber briefly warms toward `#F3DDA2` and back: the "purify" effect from the animated logo.
- A short line explaining the heart: `הקו המוזהב מקיף את הלב ככל שמתקדמים בלימוד`.
- **Streak rule note** (small, under the streak): `הרצף נשמר בשבת ובחג, ואת השיעור משלימים במוצאי שבת`.
- **Buttons:**
  - `נסה רמה אחרת`, which goes back to S2 (points are not awarded twice for the same level).
  - `טעימה משינון` (if the Shinun flag is on).
  - `אודות`.

#### S6: Shinun taste (`#/shinun`, feature flag `VITE_FEATURE_SHINUN`, default on)

- Shows a single short sentence, chosen in content as `shinun.sentenceId`.
- **Round 0:** the full sentence, read aloud by the user (the screen says `קראו בקול`).
- **Rounds 1–3:** progressively more words are hidden (about ⅓, about ⅔, then all but the first letter of each word). Hidden words show as soft navy-tint pills. Tapping a pill reveals that word.
- After each round the user marks `הצלחתי` or `עוד פעם`.
- At the end comes a short note that the full Shinun path works mainly by audio, over a kosher phone line, for schools.
- No microphone and no recording.

#### S7: About & credits (`#/about`)

- **What is Tanya Chai:** 3–4 short lines.
- **The three paths, one line each:** מתמיד, שינון, משכיל. Organizational or business models are not named.
- **Sources and credits:** the Hebrew text from Sefaria; the English translation with the exact attribution line required by its license (from the API metadata, §8.1); the ביאור and questions written for Tanya Chai.
- `התחל מחדש`: resets all local demo state.
- A contact line placeholder: `[TO FILL BY ALEX]`.
- Version and build date (from the build).

### 3.2 Global UI rules

- `<html lang="he" dir="rtl">`. English blocks get `dir="ltr" lang="en"`. Never mix directions inside one text node. When Hebrew and Latin text (numbers, `EN`) sit in one line, wrap the embedded run in `<bdi>`.
- Mobile first, designed for 360–430px width. On larger screens the layout is a single centered column with a max width of 680px.
- **Navigation:** hash-based (`#/read`) so GitHub Pages needs no SPA fallback. The browser back button works.
- **State:** the current level, progress and answers survive a reload. They are kept in `localStorage`, with every access wrapped in try/catch; the demo works without storage.
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
- **Scale (phones):** Tanya text 21px; ביאור 16px; UI 15–16px; screen titles 24px; completion headline 28px.

### 4.3 Logo

The logo source files are in `brand/logo/`, and `brand/logo/README.md` describes them. Build a `<HeartMark progress={0..100} animated? beating? purify? size? />` React component that renders the same path data:

- The contour is `stroke-dasharray={`${progress} 100`}` on a path with `pathLength="100"`.
- The transition between values uses CSS `transition: stroke-dasharray 1.2s ease-in-out`. If that is not smooth on Safari, animate the dashoffset instead.
- Use `brand/logo/favicon.svg` as the favicon, copied to `public/`.
- Do not redraw or "improve" the logo. Its geometry is final.

### 4.4 Tone of interface text

- Hebrew of the Chabad world: ביאור (not הסבר), שיעור, לימוד, משפט.
- Warm and respectful. No slang, no exclamation overload, no childish phrasing.
- Gender-neutral plural forms are preferred for instructions (`קראו`, `בחרו`).
- All UI strings live in `src/strings/he.ts`, so they can be reviewed in one place and an English UI can be added later.

---

## 5. Technical architecture

### 5.1 Stack

- **Vite + React 18 + TypeScript** (strict).
- **Styling:** plain CSS with custom properties (one CSS file per component or CSS modules). No CSS framework.
- **No state library:** use a `useReducer` app store plus context.
- **Lint and format:** ESLint (typescript-eslint, react-hooks) and Prettier.
- **Tests:** Vitest for content validation and the pure logic (scoring, streak, shuffling); Playwright smoke test (optional, milestone M7).
- **Node:** 20 LTS.

### 5.2 Folder layout

```
tanya-chai-demo/
├─ SPEC.md                    ← this file
├─ CLAUDE.md                  ← working rules for Claude Code
├─ README.md
├─ LICENSE                    ← Apache-2.0 (code)
├─ brand/
│  └─ logo/                   ← source logo files (do not edit)
├─ public/
│  ├─ favicon.svg
│  └─ CNAME                   ← "demo.tanyachai.app" (milestone M7)
├─ scripts/
│  ├─ fetch-sefaria.mjs       ← downloads the raw text once (§8.1)
│  └─ validate-content.mjs    ← schema and integrity checks (§8.4)
├─ content/
│  ├─ raw/
│  │  └─ tanya-32.sefaria.json   ← untouched API response + metadata
│  ├─ portions/
│  │  └─ adar1-23.json           ← the demo portion (§6)
│  └─ CONTENT-LICENSE.md         ← terms for the texts (§9)
├─ src/
│  ├─ main.tsx, App.tsx, router.ts
│  ├─ store/        (reducer, actions, persistence)
│  ├─ screens/      (Home, Level, Read, Quiz, Done, Shinun, About)
│  ├─ components/   (HeartMark, Sentence, Bilur, GlossarySheet, QuestionCard, …)
│  ├─ content/      (types.ts, loader.ts)
│  ├─ strings/he.ts
│  └─ styles/       (tokens.css, base.css)
└─ .github/workflows/deploy.yml
```

### 5.3 State (persisted under one `localStorage` key, `tanyachai.demo.v1`)

```ts
type DemoState = {
  level: 1 | 2 | 3;
  streak: number;                 // seeded 12
  points: number;                 // seeded 340
  heartProgress: number;          // seeded 62, 0..100
  completedLevels: (1 | 2 | 3)[]; // prevents double awarding
  quiz: { questionIds: string[]; index: number; attempts: Record<string, number>; earned: number } | null;
  englishOpen: Record<string, boolean>; // per paragraph id
  seenShinun: boolean;
};
```

**Rules:**

- Completing a level for the first time awards the points, increments the streak once per session (not per level), and advances `heartProgress` by 3, capped at 100.
- The streak is a demo value. The Shabbos rule is displayed but not computed.

---

## 6. Content model

One JSON file per portion, validated against TypeScript types and by `scripts/validate-content.mjs`.

```ts
type Portion = {
  id: "adar1-23";
  label: { he: "שיעור לדוגמה: כ״ג אדר א׳" };
  location: { he: "ליקוטי אמרים, פרק ל״ב"; en: "Likkutei Amarim, chapter 32" };
  boundariesConfirmed: boolean;          // false until Alex confirms the daily division
  sources: Source[];                     // see §8.1
  paragraphs: Paragraph[];
  glossary: GlossaryEntry[];
  questions: Question[];
  shinun?: { sentenceId: string; rounds: number[][] }; // word indices hidden per round
};

type Source = {
  id: "sefaria-he" | "sefaria-en";
  ref: string;              // the exact Sefaria ref used
  versionTitle: string;
  license: string;          // copied verbatim from the API response
  attribution: string;      // the exact line shown in About
  url: string;
};

type Paragraph = {
  id: string;               // "p1"
  sourceSegment: number;    // Sefaria segment index (1-based)
  en: string;               // English for the whole paragraph, from sefaria-en
  sentences: Sentence[];
};

type Sentence = {
  id: string;               // "s1", unique across the portion
  he: string;               // exact Hebrew text of this sentence (from sefaria-he)
  biur?: { short?: Reviewed<string>; long?: Reviewed<string> };
  glossary?: { entryId: string; match: string }[]; // exact substring in `he` to underline
};

type GlossaryEntry = { id: string; term: string; body: Reviewed<string> };

type Question = {
  id: string;
  level: 1 | 2 | 3;
  kind: "choice" | "trueFalse" | "findSentence";
  category: "literal" | "understanding" | "concept";
  prompt: Reviewed<string>;
  options?: { id: string; text: string }[];   // choice
  answer: string;                             // option id, "true"/"false", or a sentence id
  sentenceRef: string;                        // sentence the answer relies on (highlighted in feedback)
  hint: Reviewed<string>;
  explanation: Reviewed<string>;
  fixedOrder?: boolean;
};

type Reviewed<T> = { value: T; reviewed: boolean; note?: string };
```

**Integrity rules** (enforced by the validator, and run in CI):

- The concatenation of all `sentences[].he` of a paragraph equals the source segment text, after normalizing whitespace and stripping HTML. In other words, the text is never edited, only split.
- Every `glossary.match` occurs in its sentence. Every `sentenceRef` and `entryId` exists.
- `level 1` questions are `literal`. Level 2 questions are `understanding`. Level 3 has at least one `concept` question.
- Every `choice` question has exactly one correct option and 3–4 options in total.
- The validator prints a **summary of unreviewed items**. It fails the build only when `CONTENT_STRICT=1` is set. The production deploy sets `CONTENT_STRICT=1` once Alex has signed off (§8.4).

---

## 7. Behavior details

- **Sentence splitting:** split at the natural sentence and clause boundaries of the Tanya text (periods, `כי`, `ולכן`, `והנה`, etc.). Aim for 1–3 lines per sentence on a phone. Splitting is done by hand in the content JSON, not at runtime.
- **Glossary underline:** rendered by splitting the sentence string at `match`. If a match appears twice, underline only the first occurrence.
- **Shuffling:** seeded per session, so a reload does not reorder a question the user is looking at.
- **Reading progress:** an IntersectionObserver per sentence.
- **Text display:** keep the original abbreviations with their gershayim, exactly as in the source (the "no gershayim" rule applies only to the name חי). Strip HTML tags from Sefaria, but preserve the text itself exactly.
- **Errors:** if content fails to load, show a calm full-screen message with a retry button. In practice the content is bundled, so this should not happen.

---

## 8. Content pipeline

### 8.1 Fetching the texts (once, by Claude Code on Alex's machine)

`scripts/fetch-sefaria.mjs`:

1. Find the exact ref for Likkutei Amarim chapter 32 on Sefaria. Open the chapter on sefaria.org and copy the ref from the URL. It is expected to be similar to `Tanya, Part I; Likkutei Amarim 32`.
2. Call the v3 texts API for Hebrew and English. For example:
   `https://www.sefaria.org/api/v3/texts/<url-encoded ref>?version=hebrew&version=english`
3. Save the **full, unmodified response** to `content/raw/tanya-32.sefaria.json`, together with the fetch date.
4. Print, for each version: `versionTitle`, `license`, `versionSource`.
5. **Stop and report to Alex** in either case:
   - the English version's license is not public domain, CC0, CC-BY or CC-BY-NC;
   - the English version is anything other than the Kehot translation of the Tanya text itself (for example, a commentary).

Runtime code never calls Sefaria. The app only reads `content/portions/*.json`, which is bundled at build time.

### 8.2 Building the portion file

Claude Code builds `content/portions/adar1-23.json` from the raw file:

- **Paragraphs:** one paragraph per Sefaria segment within the portion boundaries.
- **Sentences:** the Hebrew of each paragraph is split by hand (§7). The text itself is never changed.
- **English:** one English text per paragraph, taken verbatim from the English version.

### 8.3 Writing the ביאור, glossary and questions

These are drafted by Claude (in the claude.ai conversation or in Claude Code) and **every item starts with `reviewed: false`**.

**Guidelines for the drafter:**

- Stay strictly within the plain meaning of the text, as it is learned in Chabad. No novel interpretations, no stories, no attributions to the Rebbe or other sources unless Alex supplies them.
- **Never** use Lessons in Tanya or any other copyrighted commentary as a source, and never imitate its phrasing.
- **Short ביאור:** at most 25 words per sentence; it explains words and the flow. **Extended ביאור:** 40–90 words per sentence, plus at most two "יסוד" notes in the whole portion.
- **Questions** test the text, not trivia.
  - **Literal:** what does the text say.
  - **Understanding:** why does it say so.
  - **Concept:** how does this connect to the idea of the chapter, for example why a lowly view of the body makes אהבת ישראל easy, or what "אחים ממש" means.
  - **Distractors:** plausible but clearly wrong according to the text, never tricky wording. Avoid "all of the above".
- **Hebrew register:** modern Hebrew that is clear and respectful, using Chabad terms.

### 8.4 Review and sign-off

1. Claude Code generates `content/REVIEW.md` from the JSON: every reviewable item in reading order, with its id. Alex can read it in one pass.
2. Alex marks corrections, either in REVIEW.md or directly in the JSON. Claude Code applies them and flips `reviewed: true` only for items Alex approved.
3. Before showing the demo publicly, all items must be `reviewed: true`. The deploy workflow then runs with `CONTENT_STRICT=1`.
4. While items are unreviewed, a small `טיוטה` badge appears in the About screen. This is development mode only, never in the strict build.

---

## 9. Licensing and attribution

- **Code:** Apache-2.0 (the existing `LICENSE`).
- **Tanya Hebrew text:** public domain. Credit Sefaria as the digital source.
- **English translation:** use the license and attribution exactly as given in the Sefaria metadata. If it is CC-BY-NC (expected), the demo is non-commercial and free, which is compatible, and the attribution line is shown in About.
- **ביאור, glossary, questions:** © Tanya Chai, all rights reserved. They are not covered by the Apache license.
- `content/CONTENT-LICENSE.md` states all of the above. `README.md` gets a short "Content license" section linking to it.

---

## 10. Deployment: GitHub Pages, step by step

### 10.1 First deployment (project URL)

1. In the repository on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. In `vite.config.ts`, set `base: process.env.VITE_BASE ?? '/'`.
3. Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run validate-content
      - run: npm run build
        env:
          VITE_BASE: /tanya-chai-demo/   # change to "/" once the custom domain is live (10.2)
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Push to `main`. Open **Actions** to watch the run. The site appears at `https://vekslera.github.io/tanya-chai-demo/`.

### 10.2 Custom domain (once `tanyachai.app` is registered)

1. **DNS:** at the domain registrar, add a CNAME record `demo` → `vekslera.github.io`.
2. **Verify the domain on GitHub** (recommended, to prevent takeover): **Profile → Settings → Pages → Add a domain**, then add the TXT record GitHub shows.
3. **Repository settings:** in **Settings → Pages → Custom domain**, enter `demo.tanyachai.app` and save. Wait for the DNS check to pass.
4. **HTTPS:** tick **Enforce HTTPS** once it becomes available; this can take up to about an hour. The `.app` domains require HTTPS in every browser, so the site will not load until the certificate is issued. That is expected.
5. **Repository files:** add `public/CNAME` containing `demo.tanyachai.app`, and change `VITE_BASE` in the workflow to `/`.

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
| M1 | **Texts:** `fetch-sefaria.mjs`, raw file committed, licenses reported, `adar1-23.json` with paragraphs, sentences and English; validator | The validator passes the text-integrity rules, and Alex has confirmed the portion boundaries |
| M2 | **Content drafts:** ביאור (short and long), glossary, 9 questions with hints and explanations, all `reviewed: false`; `REVIEW.md` generated | REVIEW.md is ready for Alex |
| M3 | **Read screen:** levels, glossary sheet, per-paragraph English, reading progress | Works on a 360px phone and on desktop; no RTL glitches |
| M4 | **Quiz:** three question types, feedback with sentence highlight, retry, points, back-to-text sheet | All 9 questions are playable, and state survives a reload |
| M5 | **Completion:** count-up, streak, heart contour animation, purify effect, level replay | Smooth on a mid-range Android; reduced motion respected |
| M6 | **Shinun taste** and the About & credits screen | Attribution lines are exact; reset works |
| M7 | **Polish and launch:** review fixes applied, `CONTENT_STRICT=1`, Lighthouse, custom domain, CNAME, filter submissions; optional Playwright smoke test | The demo runs at `https://demo.tanyachai.app` on Alex's phone, and the QR code for slide 7 is generated |

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

1. Confirm the exact end of the כ״ג אדר א׳ portion (§2).
2. Review all content in `content/REVIEW.md` (§8.4).
3. Fill in the contact line on the About screen.
4. Register `tanyachai.app` and set the DNS record (§10.2).
5. Review the UI strings in `src/strings/he.ts`.
