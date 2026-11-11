// A taste of Shinun (S6): one sentence, words hidden round by round.

const FIRST_LETTER = /^[^א-ת]*[א-ת][֑-ׇ]*/;

/** The first letter of a word with its nikud, keeping any punctuation before it (״אַ...). */
export function firstLetter(word: string): string {
  return word.match(FIRST_LETTER)?.[0] ?? word;
}

export const wordsOf = (sentence: string) => sentence.split(/\s+/);

export type ShinunWord = { index: number; text: string; hidden: boolean };

/** The words of a round: hidden ones are those listed for the round and not yet revealed. */
export function roundWords(
  sentence: string,
  hiddenInRound: readonly number[],
  revealed: ReadonlySet<number>,
): ShinunWord[] {
  const hidden = new Set(hiddenInRound);
  return wordsOf(sentence).map((text, index) => ({
    index,
    text,
    hidden: hidden.has(index) && !revealed.has(index),
  }));
}
