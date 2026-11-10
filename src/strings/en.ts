// English strings. The app's UI is Hebrew only (SPEC §12); these serve the English print of the
// ביאור משולב, with the same keys as their Hebrew counterparts.
import type { Source } from '../domain/types.ts';

export const en = {
  appName: { full: 'Tanya Chai' },
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
