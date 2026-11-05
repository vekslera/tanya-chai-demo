// Loads today's portion through the sources the app was given (src/ports.ts), whatever they are:
// bundled files today, possibly the Sefaria API for the text later.
import { assemblePortion, portionRanges, type AssembledPortion } from '../domain/portion';
import { chaptersOf } from '../domain/units';
import type { LearningContentSource, TextSource } from '../ports';

export async function loadPortion(
  text: TextSource,
  content: LearningContentSource,
): Promise<AssembledPortion> {
  const [portion, schedule, glossary] = await Promise.all([
    content.portion(),
    content.schedule(),
    content.glossary(),
  ]);
  const chapters = chaptersOf(portionRanges(portion, schedule));
  const perChapter = await Promise.all(
    chapters.map((ch) =>
      Promise.all([text.units(ch), text.translations(ch), content.unitContent(ch)]),
    ),
  );
  return assemblePortion({
    portion,
    schedule,
    glossary,
    units: perChapter.flatMap(([units]) => units),
    translations: perChapter.flatMap(([, translations]) => translations),
    unitContent: perChapter.flatMap(([, , unitContent]) => unitContent),
  });
}
