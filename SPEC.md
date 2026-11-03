# Tanya Chai (תניא חי): Demo Specification

**Version:** 1.1 (draft for build; adds Avos uBanim, uses the texts in `resources/`)
**Owner:** Alex Veksler
**Repository:** `vekslera/tanya-chai-demo` (public; code under Apache-2.0, content under its own terms, see §9)
**Target URL:** `https://demo.tanyachai.app` (initially `https://vekslera.github.io/tanya-chai-demo/`)

---

## 1. Purpose

A short, polished, clickable demo of the **Matmid** path (the daily portion of Tanya with short ביאור and questions) and of **Avos uBanim** (לימוד אבות ובנים: a father learning the same portion with his son). It is shown from a smartphone to leaders of organizations and institutions, including organizations that run Avos uBanim learning, and linked from slide 7 of the presentation deck (QR code).

The message of the whole project is **chayus in learning and understanding** of Tanya, for all ages. Memorization is a secondary path, so the demo does not lead with it.

The demo has to make four things felt within about three minutes:

1. **Learning at your own level.** The same portion can be studied as the text alone, with a short ביאור, or with an extended ביאור, and the questions change with the level.
2. **Immediate, warm feedback.** Each answer points back to the sentence in the text it relies on.
3. **A living sense of progress.** At the end come a streak, the gold heart contour of the logo advancing, and a counter of the learning completed together by the community.
4. **Avos uBanim.** A father gets ready-made tools for learning the portion with his son: a ביאור for the father, suggested words for explaining each sentence to a child, a question for the conversation, and simple questions the son answers. The demo does not rely on the father's own skill to explain Tanya.

A taste of **Shinun** (memorization) exists behind a feature flag, off by default.

It is **not** the MVP. There are no accounts, no backend and no analytics. Everything is static and runs from local JSON.

### 1.1 Success criteria

- A first-time user can open the link on a phone and finish the whole portion, at any level, in 3–6 minutes without guidance.
- A father who has never learned Tanya with his son can follow the Avos uBanim screen without preparation.
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
| Start | `וְהִנֵּה, עַל יְדֵי קִיּוּם הַדְּבָרִים הַנִּזְכָּרִים לְעֵיל` (beginning of chapter 32) |
| End | **TO CONFIRM BY ALEX** from the official daily division for כ״ג אדר א׳ (e.g. chabad.org daily Tanya). Until confirmed, use the first two paragraphs (lines) of the Hebrew resource file and set `portion.boundariesConfirmed: false`. |
| Hebrew text | `resources/texts/HE/tanya/likkutei-amarim/32`, supplied by Alex: the whole chapter with nikud and punctuation, one paragraph per line, abbreviations written out. This file is the source of truth for the Hebrew. |
| English text | `resources/texts/ENG/tanya/likkutei-amarim/32` if Alex adds it; otherwise Sefaria's English version of Tanya (Kehot translation), fetched once (§8.1). Check its license. |
| ביאור, glossary, questions, Avos uBanim tools | Original content written for this demo (§8.3), reviewed by Alex |

**Lessons in Tanya must not appear anywhere** in this repository: not quoted, not paraphrased closely, not used as a hidden source for the ביאור. The same applies to any other copyrighted commentary.

---

## 3. User flow

```
Home ──► Choose level ──► Read ──► Questions ──► Completion
  │                        ▲  │                     │
  │                        └──┘ (back to text)      └──► (flag, off) Shinun taste
  ├──► Avos uBanim ──► Son's questions ──► Completion (shared)
  └──► About & credits
```

### 3.1 Screens

#### S1: Home (`#/`)

- The animated logo symbol (`resources/brand/logo/logo-mark-animated.svg`, inlined as a React component), with the wordmark below it: תניא in navy, חי in deep gold, Frank Ruhl Libre 900. The name is always written without gershayim.
- A card reading `שיעור לדוגמה: כ״ג אדר א׳`, with the chapter label `ליקוטי אמרים, פרק ל״ב` and the estimated time (`כ־5 דקות`).
- Status row: the streak, with a small heart-pulse icon and the text `רצף: 12 ימים` (no fire emoji). Points are not shown here.
- Primary button: `התחל ללמוד`.
- Secondary button: `לימוד אבות ובנים` (S8).
- Link: `אודות תניא חי`.
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
- **Body:** the text, split into **sentences**, each a block with a little breathing room. Frank Ruhl Libre 400, 20–22px on phones, line-height 2.0, since the text carries nikud.
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

- Shows a single short sentence, chosen in content as `shinun.sentenceId`.
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

- **Intro card:** the title `לימוד אבות ובנים`, and one line: `האב קורא, מסביר ושואל, והילד עונה. כל מה שצריך לומר כתוב כאן.` A button `מתחילים`.
- **One sentence per card**, moving forward with `הבא` and back with `הקודם`. Each card shows:
  - the Tanya sentence, large;
  - `לאבא`: a short ביאור for the father (1–2 lines);
  - `לומר לילד`: ready-made words the father can read aloud as they are, in simple Hebrew (1–3 short sentences), in a warm gold-tinted card;
  - `שאלה לשיחה`: on some sentences only, an open question for the conversation. It is not scored.
- The glossary terms work here too.
- **After the last card:** `עכשיו תורו של הילד`, and then S9.
- Large text and large buttons: the phone is passed between father and son, often in a noisy place, such as a full beis midrash. Nothing depends on sound.
- No names or other personal details are entered.

#### S9: The son's questions (`#/together/quiz`)

- 3 simple questions with 2–3 answer options each, large buttons, one question per screen.
- Gentle feedback: a correct answer turns gold with a short warm line. After a wrong answer there is no red: the line `ננסה שוב?` appears, with the sentence from the text and the words the father said about it. The son may try again.
- The son sees points (`+10`); children may see points and ranks, unlike the adult screens.
- **Completion (shared):** the same completion screen (S5), worded for both: `סיימתם את השיעור יחד!`, a family streak (`רצף משפחתי`), the heart advancing, and the community counter.

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
- **Tests:** Vitest for content validation and the pure logic (scoring, streak, shuffling); Playwright smoke test (optional, milestone M7).
- **Node:** 20 LTS.

### 5.2 Folder layout

```
tanya-chai-demo/
├─ SPEC.md                    ← this file
├─ CLAUDE.md                  ← working rules for Claude Code
├─ README.md
├─ LICENSE                    ← Apache-2.0 (code)
├─ resources/                 ← supplied by Alex; never edited by code
│  ├─ brand/logo/             ← source logo files
│  └─ texts/
│     ├─ HE/tanya/likkutei-amarim/32    ← Hebrew, with nikud, one paragraph per line
│     └─ ENG/tanya/likkutei-amarim/     ← English, if Alex adds it; else the Sefaria raw file (§8.1)
├─ public/
│  ├─ favicon.svg
│  └─ CNAME                   ← "demo.tanyachai.app" (milestone M7)
├─ scripts/
│  ├─ fetch-sefaria.mjs       ← downloads the English once, if needed (§8.1)
│  └─ validate-content.mjs    ← schema and integrity checks (§8.4)
├─ content/
│  ├─ portions/
│  │  └─ adar1-23.json           ← the demo portion (§6)
│  ├─ REVIEW.md                  ← generated for Alex's review (§8.4)
│  └─ CONTENT-LICENSE.md         ← terms for the texts (§9)
├─ src/
│  ├─ main.tsx, App.tsx, router.ts
│  ├─ store/        (reducer, actions, persistence)
│  ├─ screens/      (Home, Level, Read, Quiz, Done, Together, TogetherQuiz, Shinun, About)
│  ├─ components/   (HeartMark, Sentence, Bilur, GlossarySheet, QuestionCard, TogetherCard, …)
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
  completedTogether: boolean;     // Avos uBanim done once (awards like a level)
  familyStreak: number;           // seeded 5, shown only in the Avos uBanim completion
  togetherIndex: number;          // current card in S8
  quiz: { track: "solo" | "together"; questionIds: string[]; index: number; attempts: Record<string, number>; earned: number } | null;
  englishOpen: Record<string, boolean>; // per paragraph id
  seenShinun: boolean;
};
```

**Rules:**

- Completing a level, or Avos uBanim, for the first time awards the points, increments the streak once per session (not per level), and advances `heartProgress` by 3, capped at 100. Completing Avos uBanim also increments `familyStreak`.
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
  id: "he-resource" | "en-resource" | "sefaria-en";
  path?: string;            // for resources: the file path in the repo
  ref?: string;             // for Sefaria: the exact ref used
  versionTitle?: string;
  license: string;          // as stated by Alex (resources) or copied verbatim from the API response
  attribution: string;      // the exact line shown in About
  url?: string;
};

type Paragraph = {
  id: string;               // "p1"
  sourceLine: number;       // line number (1-based) in the Hebrew resource file
  enSegments?: number[];    // Sefaria English segments matched to this paragraph (§8.1)
  en: string;               // English for the whole paragraph
  sentences: Sentence[];
};

type Sentence = {
  id: string;               // "s1", unique across the portion
  he: string;               // exact Hebrew text of this sentence, with nikud, from the resource file
  biur?: { short?: Reviewed<string>; long?: Reviewed<string> };
  glossary?: { entryId: string; match: string }[]; // exact substring in `he` to underline
  together?: {              // Avos uBanim (S8)
    forParent: Reviewed<string>; // short ביאור for the father
    toChild: Reviewed<string>;   // words the father reads aloud to his son
    talk?: Reviewed<string>;     // open question for the conversation, unscored
  };
};

type GlossaryEntry = { id: string; term: string; body: Reviewed<string> };

type Question = {
  id: string;
  track: "solo" | "together";  // together = the son's questions (S9)
  level?: 1 | 2 | 3;           // solo track only
  kind: "choice" | "trueFalse" | "findSentence";
  category: "literal" | "understanding" | "concept" | "child";
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

- The concatenation of all `sentences[].he` of a paragraph equals its line in the Hebrew resource file, after trimming and normalizing whitespace. In other words, the text is never edited, only split.
- Every `glossary.match` occurs in its sentence. Every `sentenceRef` and `entryId` exists.
- In the solo track, level 1 questions are `literal`, level 2 questions are `understanding`, and level 3 has at least one `concept` question.
- Every sentence has `together.forParent` and `together.toChild`. The together track has exactly 3 questions, all `category: "child"`, `kind` `choice` or `trueFalse`, with 2–3 options.
- Every solo `choice` question has exactly one correct option and 3–4 options in total.
- The validator prints a **summary of unreviewed items**. It fails the build only when `CONTENT_STRICT=1` is set. The production deploy sets `CONTENT_STRICT=1` once Alex has signed off (§8.4).

---

## 7. Behavior details

- **Sentence splitting:** split at the natural sentence and clause boundaries of the Tanya text (periods, `כי`, `ולכן`, `והנה`, etc.). Aim for 1–3 lines per sentence on a phone. Splitting is done by hand in the content JSON, not at runtime.
- **Glossary underline:** rendered by splitting the sentence string at `match`. If a match appears twice, underline only the first occurrence.
- **Shuffling:** seeded per session, so a reload does not reorder a question the user is looking at.
- **Reading progress:** an IntersectionObserver per sentence.
- **Text display:** show the Hebrew exactly as in the resource file, with its nikud, punctuation and written-out abbreviations. (The "no gershayim" rule applies only to the name חי.) Strip HTML tags from Sefaria's English, but keep its words exactly.
- **Matching with nikud:** glossary matches and hidden-word logic work on the vocalized text as it is. Do not strip nikud for display or for matching.
- **Errors:** if content fails to load, show a calm full-screen message with a retry button. In practice the content is bundled, so this should not happen.

---

## 8. Content pipeline

### 8.1 The texts

**Hebrew.** Read `resources/texts/HE/tanya/likkutei-amarim/32`. Each line is one paragraph. Never change this file. Alex records which edition the vocalized text comes from, and its terms, in `resources/texts/HE/SOURCE.md` (§13).

**English.** If Alex has added `resources/texts/ENG/tanya/likkutei-amarim/32`, use it. Otherwise `scripts/fetch-sefaria.mjs` fetches it once, on Alex's machine:

1. Find the exact ref for Likkutei Amarim chapter 32 on Sefaria. Open the chapter on sefaria.org and copy the ref from the URL. It is expected to be similar to `Tanya, Part I; Likkutei Amarim 32`.
2. Call the v3 texts API for the English version. For example:
   `https://www.sefaria.org/api/v3/texts/<url-encoded ref>?version=english`
3. Save the **full, unmodified response** to `resources/texts/ENG/tanya/likkutei-amarim/32.sefaria.json`, together with the fetch date.
4. Print the version's `versionTitle`, `license` and `versionSource`.
5. **Stop and report to Alex** in either case:
   - the license is not public domain, CC0, CC-BY or CC-BY-NC;
   - the version is anything other than the Kehot translation of the Tanya text itself (for example, a commentary).

**Alignment.** Sefaria's English segments may not match the lines of the Hebrew file. Match English to each Hebrew paragraph by hand, joining or dividing English segments only at sentence boundaries, and record the match in `paragraph.enSegments`. If a paragraph cannot be matched cleanly, ask Alex.

Runtime code never calls Sefaria. The app only reads `content/portions/*.json`, which is bundled at build time.

### 8.2 Building the portion file

Claude Code builds `content/portions/adar1-23.json` from the resources:

- **Paragraphs:** one paragraph per line of the Hebrew file within the portion boundaries.
- **Sentences:** the Hebrew of each paragraph is split by hand (§7). The text itself is never changed.
- **English:** one English text per paragraph, taken verbatim from the English source.

### 8.3 Writing the ביאור, glossary, questions and Avos uBanim tools

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
- **Avos uBanim** (written for boys of school age, about 8–12):
  - **For the father (`forParent`):** at most 30 words; what the sentence says and why, so the father understands before explaining.
  - **To the child (`toChild`):** 1–3 short sentences, at most 35 words, that the father can read aloud as they are. Simple words and examples from a child's world (family, friends, class), always faithful to the text. No invented stories attributed to anyone.
  - **Conversation (`talk`):** on 2–3 sentences only; an open question about the child's own life, with no right answer.
  - **The son's questions:** 3 questions with 2–3 options, about the main idea, never about wording.
- **Hebrew register:** modern Hebrew that is clear and respectful, using Chabad terms.

### 8.4 Review and sign-off

1. Claude Code generates `content/REVIEW.md` from the JSON: every reviewable item in reading order, with its id. Alex can read it in one pass.
2. Alex marks corrections, either in REVIEW.md or directly in the JSON. Claude Code applies them and flips `reviewed: true` only for items Alex approved.
3. Before showing the demo publicly, all items must be `reviewed: true`. The deploy workflow then runs with `CONTENT_STRICT=1`.
4. While items are unreviewed, a small `טיוטה` badge appears in the About screen. This is development mode only, never in the strict build.

---

## 9. Licensing and attribution

- **Code:** Apache-2.0 (the existing `LICENSE`).
- **Tanya Hebrew text:** the words are public domain, but the nikud and punctuation of a modern edition may be protected. The About screen credits the edition named in `resources/texts/HE/SOURCE.md`, under the terms recorded there.
- **English translation:** use the license and attribution exactly as given in the Sefaria metadata. If it is CC-BY-NC (expected), the demo is non-commercial and free, which is compatible, and the attribution line is shown in About.
- **ביאור, glossary, questions, Avos uBanim tools:** © Tanya Chai, all rights reserved. They are not covered by the Apache license.
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
| M1 | **Texts:** the Hebrew from `resources/`, the English (from `resources/` or fetched with `fetch-sefaria.mjs`, license reported), `adar1-23.json` with paragraphs, sentences and English; validator | The validator passes the text-integrity rules, and Alex has confirmed the portion boundaries |
| M2 | **Content drafts:** ביאור (short and long), glossary, 9 solo questions with hints and explanations, the Avos uBanim tools for every sentence and 3 questions for the son, all `reviewed: false`; `REVIEW.md` generated | REVIEW.md is ready for Alex |
| M3 | **Read screen:** levels, glossary sheet, per-paragraph English, reading progress | Works on a 360px phone and on desktop; no RTL glitches |
| M4 | **Quiz:** three question types, feedback with sentence highlight, retry, points, back-to-text sheet | All 9 questions are playable, and state survives a reload |
| M5 | **Completion:** streak, heart contour animation, purify effect, community counter, points line, level replay | Smooth on a mid-range Android; reduced motion respected |
| M6 | **Avos uBanim** (S8, S9, shared completion) and the About & credits screen | A father can go through all cards and his son's questions on one phone; attribution lines are exact; reset works |
| M7 | **Polish and launch:** review fixes applied, `CONTENT_STRICT=1`, Lighthouse, custom domain, CNAME, filter submissions; optional Playwright smoke test | The demo runs at `https://demo.tanyachai.app` on Alex's phone, and the QR code for slide 7 is generated |
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

1. Confirm the exact end of the כ״ג אדר א׳ portion (§2).
2. Name the edition the vocalized Hebrew text comes from, and its terms, in `resources/texts/HE/SOURCE.md` (§8.1, §9).
3. Review all content in `content/REVIEW.md` (§8.4), including the Avos uBanim tools.
4. Fill in the contact line on the About screen.
5. Register `tanyachai.app` and set the DNS record (§10.2).
6. Review the UI strings in `src/strings/he.ts`.
