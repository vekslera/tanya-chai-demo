// Loads every layer from disk and runs the integrity rules of SPEC §6.5.
import fs from 'node:fs';
import path from 'node:path';
import { buildUnits, checkUnits, paragraphs, UNIT_ID } from './units.mjs';

export const root = path.resolve(import.meta.dirname, '../..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(root, rel));

export function loadAll() {
  const part = 'LA';
  const chapter = 32;
  const raw = fs.readFileSync(
    path.join(root, `resources/texts/HE/tanya/${part}/${chapter}`),
    'utf8',
  );
  const splits = readJson(`data/splits/${part}/${chapter}.json`);
  const built = buildUnits({ raw, splits, part, chapter });
  const translationsPath = `data/translations/en/${part}/${chapter}.json`;
  const enResourcePath = `resources/texts/ENG/tanya/${part}/${chapter}`;
  return {
    part,
    chapter,
    splits,
    ...built,
    schedule: readJson('data/schedules/daily.json'),
    translations: exists(translationsPath) ? readJson(translationsPath) : null,
    enResource: exists(enResourcePath)
      ? paragraphs(fs.readFileSync(path.join(root, enResourcePath), 'utf8')).map((l) => l.trim())
      : null,
    unitContent: exists(`content/${part}/${chapter}.json`)
      ? readJson(`content/${part}/${chapter}.json`)
      : [],
    glossary: exists('content/glossary.json') ? readJson('content/glossary.json') : [],
    portion: exists('content/portions/adar-09.json')
      ? readJson('content/portions/adar-09.json')
      : null,
  };
}

const isReviewed = (r) =>
  r && typeof r === 'object' && typeof r.value === 'string' && typeof r.reviewed === 'boolean';

/** Every Reviewed<string> in reading order, as { id, label, item }. */
export function reviewables(all) {
  const out = [];
  const byId = new Map(all.units.map((u) => [u.id, u]));
  for (const c of all.unitContent) {
    if (c.biur?.short)
      out.push({
        id: `${c.id}/biur`,
        label: `ביאור ${c.id}`,
        item: c.biur.short,
        unit: byId.get(c.id),
      });
  }
  for (const g of all.glossary)
    out.push({ id: `glossary/${g.id}`, label: `מילון: ${g.term}`, item: g.body });
  for (const q of all.portion?.questions ?? []) {
    for (const key of ['prompt', 'hint', 'explanation']) {
      out.push({ id: `${q.id}/${key}`, label: `${q.id} ${key}`, item: q[key], question: q });
    }
  }
  for (const c of all.portion?.together ?? []) {
    for (const key of ['forParent', 'toChild', 'talk']) {
      if (c[key])
        out.push({ id: `${c.id}/${key}`, label: `${c.id} ${key}`, item: c[key], card: c });
    }
  }
  return out;
}

export function validate(all) {
  const errors = [...all.errors];
  if (errors.length) return { errors, warnings: [] };
  errors.push(...checkUnits(all));
  const warnings = [];
  const units = all.units;
  const byId = new Map(units.map((u) => [u.id, u]));
  const seqOf = (id) => byId.get(id)?.seq;
  const unitRef = (where, id) => {
    if (!byId.has(id)) errors.push(`${where}: unknown unit ${id}`);
  };
  const range = (where, r) => {
    unitRef(where, r.from);
    unitRef(where, r.to);
    if (byId.has(r.from) && byId.has(r.to) && seqOf(r.from) > seqOf(r.to)) {
      errors.push(`${where}: ${r.from} is after ${r.to}`);
    }
  };
  const inRange = (r) => units.filter((u) => u.seq >= seqOf(r.from) && u.seq <= seqOf(r.to));

  // Schedule
  for (const yearType of ['regular', 'leap']) {
    for (const [key, ranges] of Object.entries(all.schedule[yearType] ?? {})) {
      ranges.forEach((r, i) => range(`schedule ${yearType}.${key}[${i}]`, r));
    }
  }

  // Translations: cover each unit of the chapter exactly once, verbatim from the resource.
  if (!all.translations) {
    warnings.push('no English translation yet (data/translations/en/LA/32.json)');
  } else {
    const covered = new Map();
    all.translations.forEach((s, i) => {
      range(`translation[${i}]`, s);
      if (!['en-resource', 'sefaria-en'].includes(s.sourceId))
        errors.push(`translation[${i}]: bad sourceId`);
      if (typeof s.text !== 'string' || !s.text.trim())
        errors.push(`translation[${i}]: empty text`);
      if (/<[^>]+>/.test(s.text)) errors.push(`translation[${i}]: contains HTML tags`);
      if (s.sourceId === 'en-resource' && all.enResource && !all.enResource.includes(s.text)) {
        errors.push(`translation[${i}]: text is not verbatim from the English resource`);
      }
      for (const u of inRange(s)) covered.set(u.id, (covered.get(u.id) ?? 0) + 1);
    });
    for (const u of units) {
      const n = covered.get(u.id) ?? 0;
      if (n !== 1) errors.push(`translation: ${u.id} covered ${n} times`);
    }
  }

  // Glossary
  const glossaryIds = new Set();
  for (const g of all.glossary) {
    if (glossaryIds.has(g.id)) errors.push(`glossary: duplicate id ${g.id}`);
    glossaryIds.add(g.id);
    if (!g.term) errors.push(`glossary ${g.id}: no term`);
    if (!isReviewed(g.body)) errors.push(`glossary ${g.id}: body is not a Reviewed<string>`);
  }

  // Unit content
  const contentIds = new Set();
  for (const c of all.unitContent) {
    unitRef('content', c.id);
    if (contentIds.has(c.id)) errors.push(`content: duplicate ${c.id}`);
    contentIds.add(c.id);
    if (c.biur?.short && !isReviewed(c.biur.short))
      errors.push(`content ${c.id}: biur is not a Reviewed<string>`);
    if (c.biur?.short) {
      const n = c.biur.short.value.trim().split(/\s+/).length;
      if (n > 25) warnings.push(`content ${c.id}: biur has ${n} words (max 25)`);
    }
    for (const m of c.glossary ?? []) {
      if (!glossaryIds.has(m.entryId))
        errors.push(`content ${c.id}: unknown glossary entry ${m.entryId}`);
      if (byId.has(c.id) && !byId.get(c.id).text.includes(m.match)) {
        errors.push(`content ${c.id}: glossary match "${m.match}" not in the unit text`);
      }
    }
  }

  // Portion
  const p = all.portion;
  if (!p) {
    errors.push('content/portions/adar-09.json is missing');
    return { errors, warnings };
  }
  const portionRanges = all.schedule[p.yearType]?.[p.dateKey];
  if (!portionRanges) {
    errors.push(`portion: no schedule entry ${p.yearType}.${p.dateKey}`);
    return { errors, warnings };
  }
  const portionUnits = portionRanges.flatMap(inRange);
  const inPortion = new Set(portionUnits.map((u) => u.id));
  if (!p.boundariesConfirmed) warnings.push('portion: boundaries not confirmed');
  for (const id of inPortion) {
    if (!all.unitContent.find((c) => c.id === id)?.biur?.short)
      warnings.push(`content: ${id} has no short biur`);
  }
  for (const s of p.sources ?? []) {
    if (!s.license || !s.attribution)
      errors.push(`source ${s.id}: license and attribution are required`);
  }

  const qIds = new Set();
  for (const q of p.questions) {
    const where = `question ${q.id}`;
    if (qIds.has(q.id)) errors.push(`${where}: duplicate id`);
    qIds.add(q.id);
    for (const key of ['prompt', 'hint', 'explanation']) {
      if (!isReviewed(q[key])) errors.push(`${where}: ${key} is not a Reviewed<string>`);
    }
    unitRef(where, q.unitRef);
    if (!inPortion.has(q.unitRef))
      errors.push(`${where}: unitRef ${q.unitRef} is outside the portion`);
    if (q.kind === 'choice') {
      const ids = (q.options ?? []).map((o) => o.id);
      if (new Set(ids).size !== ids.length) errors.push(`${where}: duplicate option ids`);
      if (ids.filter((id) => id === q.answer).length !== 1)
        errors.push(`${where}: needs exactly one correct option`);
      const [min, max] = q.track === 'solo' ? [3, 4] : [2, 3];
      if (ids.length < min || ids.length > max)
        errors.push(`${where}: ${ids.length} options (expected ${min}–${max})`);
    } else if (q.kind === 'trueFalse') {
      if (!['true', 'false'].includes(q.answer))
        errors.push(`${where}: answer must be "true" or "false"`);
    } else if (q.kind === 'findSentence') {
      unitRef(where, q.answer);
      if (!inPortion.has(q.answer))
        errors.push(`${where}: answer ${q.answer} is outside the portion`);
    } else {
      errors.push(`${where}: unknown kind ${q.kind}`);
    }
  }
  const solo = (level) => p.questions.filter((q) => q.track === 'solo' && q.level === level);
  const count = (qs, cat) => qs.filter((q) => q.category === cat).length;
  const l1 = solo(1);
  if (l1.length !== 3 || count(l1, 'literal') !== 3)
    errors.push('level 1 needs exactly 3 literal questions');
  const l2 = solo(2);
  if (l2.length !== 3 || count(l2, 'understanding') !== 2 || count(l2, 'concept') !== 1) {
    errors.push('level 2 needs exactly 2 understanding questions and 1 concept question');
  }
  const together = p.questions.filter((q) => q.track === 'together');
  if (together.length !== 3)
    errors.push(`together track has ${together.length} questions (expected 3)`);
  for (const q of together) {
    if (q.category !== 'child')
      errors.push(`question ${q.id}: together questions are category "child"`);
    if (!['choice', 'trueFalse'].includes(q.kind))
      errors.push(`question ${q.id}: together questions are choice or trueFalse`);
  }

  // Avos uBanim cards: 6–8, covering the portion exactly once, in order.
  const cards = p.together ?? [];
  if (cards.length < 6 || cards.length > 8)
    errors.push(`together: ${cards.length} cards (expected 6–8)`);
  const cardUnits = [];
  for (const c of cards) {
    range(`card ${c.id}`, c);
    for (const key of ['forParent', 'toChild']) {
      if (!isReviewed(c[key])) errors.push(`card ${c.id}: ${key} is not a Reviewed<string>`);
    }
    if (c.talk && !isReviewed(c.talk)) errors.push(`card ${c.id}: talk is not a Reviewed<string>`);
    for (const [key, max] of [
      ['forParent', 30],
      ['toChild', 35],
    ]) {
      const n = c[key]?.value.trim().split(/\s+/).length ?? 0;
      if (n > max) warnings.push(`card ${c.id}: ${key} has ${n} words (max ${max})`);
    }
    if (byId.has(c.from) && byId.has(c.to)) cardUnits.push(...inRange(c).map((u) => u.id));
  }
  if (cardUnits.join() !== portionUnits.map((u) => u.id).join()) {
    errors.push('together: cards do not cover the portion units exactly once, in order');
  }
  const talks = cards.filter((c) => c.talk).length;
  if (talks < 2 || talks > 3) warnings.push(`together: ${talks} cards with a talk question (2–3)`);

  if (p.shinun) {
    unitRef('shinun', p.shinun.unitId);
    const wordCount = byId.get(p.shinun.unitId)?.text.trim().split(/\s+/).length ?? 0;
    if (!Array.isArray(p.shinun.rounds)) errors.push('shinun: rounds must be an array');
    for (const round of p.shinun.rounds ?? []) {
      if (round.some((i) => !Number.isInteger(i) || i < 0 || i >= wordCount)) {
        errors.push(`shinun: word index out of range (the unit has ${wordCount} words)`);
      }
    }
  }

  // Unit IDs used anywhere must be well-formed.
  for (const u of units) if (!UNIT_ID.test(u.id)) errors.push(`${u.id}: malformed unit ID`);

  return { errors, warnings };
}
