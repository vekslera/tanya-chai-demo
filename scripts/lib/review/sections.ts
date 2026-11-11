// The three sections of the review document: the text with its ביאור and glossary, the
// questions, and the Avos uBanim cards.
import type { Portion, Question, Unit } from '../../../src/domain/types.ts';
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
  const levels = Object.entries(rules.levelQuestions).map(([level, categories]) => {
    const counts = Object.entries(categories)
      .map(([cat, n]) => `${n} ${cat}`)
      .join(', ');
    const title = `Level ${level}: ${he.level.options[Number(level)]?.title ?? ''} (${counts})`;
    return [title, (q: Question) => q.track === 'solo' && String(q.level) === level] as const;
  });
  const sections = [
    ...levels,
    [`Avos uBanim: ${he.togetherQuiz.title}`, (q: Question) => q.track === 'together'] as const,
  ];
  for (const [title, belongs] of sections) {
    out.push(`### ${title}`, '');
    for (const q of p.questions.filter(belongs)) {
      out.push(`#### ${q.id} (${q.kind}, ${q.category}), relies on ${q.unitRef}`, '');
      out.push(item('prompt', q.prompt), ...answerLines(q, all));
      out.push(item('hint', q.hint), item('explanation', q.explanation), '');
    }
  }
  return out;
}

export function cardsSection(all: ChapterLayers, p: Portion): string[] {
  const out = ['## 3. Avos uBanim cards', ''];
  for (const c of p.together) {
    out.push(`### ${c.id} (${c.from}–${c.to})`, '', quote(unitsIn(all.units, c)), '');
    out.push(item(`${he.together.forParent} (forParent)`, c.forParent));
    out.push(item(`${he.together.toChild} (toChild)`, c.toChild));
    if (c.talk) out.push(item(`${he.together.talk} (talk)`, c.talk));
    out.push('');
  }
  return out;
}
