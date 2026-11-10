// The three sections of the review document: the text with its ביאור and glossary, the
// questions, and the Avos uBanim cards.
import type { Portion, Question, Unit } from '../../../src/domain/types.ts';
import { unitsIn } from '../../../src/domain/units.ts';
import { he } from '../../../src/strings/he.ts';
import { appLanguage, type ContentRules } from '../config.ts';
import type { ChapterLayers } from '../load.ts';
import { item, quote } from './item.ts';

export function textSection(all: ChapterLayers, portionUnits: Unit[]): string[] {
  const content = new Map(all.unitContent.map((c) => [c.id, c]));
  const glossary = new Map(all.glossary.map((g) => [g.id, g]));
  const out = ['## 1. Text and short ביאור', ''];
  let paragraph = 0;
  for (const u of portionUnits) {
    if (u.paragraph !== paragraph) {
      paragraph = u.paragraph;
      out.push(`### Paragraph ${paragraph}`, '');
    }
    out.push(`#### ${u.id}`, '', quote([u]), '');
    const c = content.get(u.id);
    const { [appLanguage]: own, ...others } = c?.biur ?? {};
    if (own?.short) out.push(item(`${u.id}/biur.${appLanguage}`, own.short));
    for (const m of c?.glossary ?? []) {
      const g = glossary.get(m.entryId)!;
      out.push(item(`glossary/${g.id}: ${g.term}`, g.body));
      if (g.source) out.push(`  Source line: ${g.source}`);
    }
    // The ביאור in another language follows that language's text of the unit.
    for (const [language, b] of Object.entries(others)) {
      const translated = all.texts[language]?.units.find((x) => x.id === u.id);
      if (translated) out.push('', quote([translated]), '');
      if (b.short) out.push(item(`${u.id}/biur.${language}`, b.short));
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
