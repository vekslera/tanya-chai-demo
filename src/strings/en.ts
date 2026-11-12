// English strings, with the same keys as their Hebrew counterparts. The app's UI is Hebrew (SPEC
// §12); these serve the English print of the ביאור משולב, and the question card in English mode
// (S3, S4).
import type { Source } from '../domain/types.ts';

export const en = {
  appName: { full: 'Tanya Chai' },
  quiz: {
    progress: (i: number, n: number) => `Question ${i} of ${n}`,
    summary: 'Summary question',
    true: 'True',
    false: 'False',
    findSentenceHelp: 'Tap the sentence in the text',
    praise: ['Very good', 'Exactly', 'Quite right', 'Well done'],
    tryAgain: 'Almost. Try again:',
    revealed: 'The correct answer:',
    fromText: 'From the text',
    next: 'Continue learning',
    finish: 'Finish the lesson',
    points: (n: number) => `+${n}`,
    chosenWrong: 'chosen answer',
  },
  print: {
    title: 'Integrated Explanation',
    legend: { text: 'The Tanya text in bold', biur: 'the explanation in regular type' },
    draft: 'Draft: the explanation is still awaiting approval.',
    page: 'Page',
    sourceCredit: (s: Source) =>
      `The English translation: ${s.versionTitle}, via Sefaria. License ${s.license}.`,
    contentCredit: 'The explanation was written for Tanya Chai. All rights reserved.',
  },
} as const;
