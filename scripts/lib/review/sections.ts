// The three sections of the review document: the text with its ביאור and glossary, the
// questions, and the Avos uBanim cards.
import { questionIdsFor } from '../../../src/domain/quiz.ts';
import type { Level, Portion, Question, Track, Unit } from '../../../src/domain/types.ts';
import { sentenceOf, unitsIn } from '../../../src/domain/units.ts';
import { he } from '../../../src/strings/he.ts';
import { appLanguage, type ContentRules } from '../config.ts';
import type { ChapterLayers } from '../load.ts';
import { item, quote } from './item.ts';

/** The portion's units, sentence by sentence (SPEC §6.2). */
function sentencesOf(units: Unit[]): Unit[][] {
  const out: Unit[][] = [];
  for (const u of units) {
    const last = out[out.length - 1];
    if (last && sentenceOf(last[0]!) === sentenceOf(u)) last.push(u);
    else out.push([u]);
  }
  return out;
}

export function textSection(all: ChapterLayers, portionUnits: Unit[]): string[] {
  const content = new Map(all.unitContent.map((c) => [c.id, c]));
  const glossary = new Map(all.glossary.map((g) => [g.id, g]));
  const out = ['## 1. Text and short ביאור', ''];
  let paragraph = 0;
  for (const units of sentencesOf(portionUnits)) {
    const first = units[0]!;
    const last = units[units.length - 1]!;
    if (first.paragraph !== paragraph) {
      paragraph = first.paragraph;
      out.push(`### Paragraph ${paragraph}`, '');
    }
    const title = units.length > 1 ? `${first.id}–${last.id.split('.').pop()}` : first.id;
    out.push(`#### ${title}`, '', quote(units), '');
    const { [appLanguage]: own, ...others } = content.get(first.id)?.biur ?? {};
    if (own?.short) out.push(item(`${first.id}/biur.${appLanguage}`, own.short));
    for (const m of units.flatMap((u) => content.get(u.id)?.glossary ?? [])) {
      const g = glossary.get(m.entryId)!;
      out.push(item(`glossary/${g.id}: ${g.term}`, g.body));
      if (g.source) out.push(`  Source line: ${g.source}`);
    }
    // The ביאור in another language follows that language's text of the sentence.
    for (const [language, b] of Object.entries(others)) {
      const ids = new Set(units.map((u) => u.id));
      const translated = all.texts[language]?.units.filter((x) => ids.has(x.id)) ?? [];
      if (translated.length) out.push('', quote(translated), '');
      if (b.short) out.push(item(`${first.id}/biur.${language}`, b.short));
    }
    out.push('');
  }
  return out;
}

function answerLines(q: Question, all: ChapterLayers): string[] {
  if (q.kind === 'choice') {
    return (q.options ?? []).map((o) => `  - ${o.id === q.answer ? '**✔**' : '✘'} ${o.text}`);
  }
  if (q.kind === 'trueFalse') {
    return [`  Answer: ${q.answer === 'true' ? he.quiz.true : he.quiz.false}`];
  }
  const unit = all.units.find((u) => u.id === q.answer)!;
  return [`  Answer: ${q.answer}: ${unit.text.trim()}`];
}

export function questionsSection(all: ChapterLayers, p: Portion, rules: ContentRules): string[] {
  const out = ['## 2. Questions', ''];
  const sections = p.sections.map((r) => new Set(unitsIn(all.units, r).map((u) => u.id)));
  const sectionOf = (q: Question) =>
    q.summary ? sections.length - 1 : sections.findIndex((s) => s.has(q.unitRef));
  const groups: [string, Track, Level | undefined][] = [
    ...Object.entries(rules.questions.levelCategories).map(
      ([level, categories]): [string, Track, Level] => [
        `Level ${level}: ${he.level.options[Number(level)]?.title ?? ''} (${categories.join(', ')})`,
        'solo',
        Number(level),
      ],
    ),
    [`Avos uBanim: ${he.together.title}`, 'together', undefined],
  ];
  const byId = new Map(p.questions.map((q) => [q.id, q]));
  for (const [title, track, level] of groups) {
    out.push(`### ${title}`, '');
    for (const id of questionIdsFor(p.questions, sectionOf, track, level)) {
      const q = byId.get(id)!;
      const where = q.summary ? 'summary' : `after section ${sectionOf(q) + 1}`;
      out.push(`#### ${q.id} (${q.kind}, ${q.category}, ${where}), relies on ${q.unitRef}`, '');
      out.push(item('prompt', q.prompt), ...answerLines(q, all));
      out.push(item('hint', q.hint), item('explanation', q.explanation), '');
    }
  }
  return out;
}

export function cardsSection(all: ChapterLayers, p: Portion): string[] {
  const out = ['## 3. Avos uBanim cards', ''];
  p.together.forEach((c, i) => {
    const s = p.sections[i]!;
    out.push(
      `### ${c.id}: section ${i + 1} (${s.from}–${s.to})`,
      '',
      quote(unitsIn(all.units, s)),
      '',
    );
    out.push(item(`${he.together.forParent} (forParent)`, c.forParent));
    out.push(item(`${he.together.toChild} (toChild)`, c.toChild));
    if (c.talk) out.push(item(`${he.together.talk} (talk)`, c.talk));
    out.push('');
  });
  return out;
}
