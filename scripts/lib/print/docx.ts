// Renders the integrated ביאור as a Word document in its language's direction: the Tanya text and
// the ביאור in distinct run styles, the text's footnotes as Word footnotes, and the sources with
// the page number in the footer.
import {
  AlignmentType,
  Document,
  Footer,
  FootnoteReferenceRun,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
  type ParagraphChild,
} from 'docx';
import type { PrintConfig, PrintLanguage } from '../config.ts';
import type { PrintModel, PrintUnit } from './model.ts';
import type { PrintStyle, RunStyle } from './style.ts';

/** Word measures font sizes in half points and spacing in twentieths of a point. */
const HALF_POINTS = 2;
const TWIPS = 20;
const LINE = 240;

type Alignment = (typeof AlignmentType)[keyof typeof AlignmentType];
type PageField = (typeof PageNumber)[keyof typeof PageNumber];

export async function toDocx(
  model: PrintModel,
  style: PrintStyle,
  print: PrintConfig,
  { tag, rtl }: PrintLanguage,
): Promise<Uint8Array> {
  /** Right-to-left properties are written only for a right-to-left language. */
  const direction = rtl ? { bidirectional: true } : {};
  const runDirection = rtl
    ? { rightToLeft: true, language: { bidirectional: tag } }
    : { language: { value: tag } };
  const runProps = (s: RunStyle) => {
    const size = Math.round(s.sizePt * HALF_POINTS);
    return {
      font: s.font,
      color: s.color,
      size,
      sizeComplexScript: size,
      bold: s.bold,
      boldComplexScript: s.bold,
      ...runDirection,
    };
  };
  const run = (text: string, s: RunStyle) => new TextRun({ text, ...runProps(s) });
  const field = (f: PageField, s: RunStyle) => new TextRun({ children: [f], ...runProps(s) });
  const paragraph = (children: ParagraphChild[], alignment: Alignment = AlignmentType.BOTH) =>
    new Paragraph({
      ...direction,
      alignment,
      spacing: {
        line: Math.round(LINE * print.lineSpacing),
        after: print.paragraphSpacingPt * TWIPS,
      },
      children,
    });
  const centered = (children: ParagraphChild[]) => paragraph(children, AlignmentType.CENTER);
  const plain = (children: ParagraphChild[], alignment: Alignment = AlignmentType.CENTER) =>
    new Paragraph({ ...direction, alignment, children });

  const unitRuns = (u: PrintUnit): ParagraphChild[] => [
    ...u.text.map((seg) =>
      seg.kind === 'note' ? new FootnoteReferenceRun(Number(seg.n)) : run(seg.text, style.text),
    ),
    ...(u.biur ? [run(` ${u.biur}`, style.biur)] : []),
    run(' ', style.text),
  ];

  const head = [
    centered([run(model.title, style.title)]),
    centered([run(model.subtitle, style.biur)]),
    centered([
      run(model.legend.text, style.text),
      run(' · ', style.note),
      run(model.legend.biur, style.biur),
    ]),
    ...(model.draft ? [centered([run(model.draft, style.draft)])] : []),
  ];
  const body = model.paragraphs.map((units) => paragraph(units.flatMap(unitRuns)));
  const footer = new Footer({
    children: [
      ...model.credits.map((c) => plain([run(c, style.note)])),
      plain([run(`${model.page} `, style.note), field(PageNumber.CURRENT, style.note)]),
    ],
  });
  const footnotes = Object.fromEntries(
    Object.entries(model.footnotes).map(([n, text]) => [
      Number(n),
      { children: [plain([run(text, style.note)], AlignmentType.START)] },
    ]),
  );

  const doc = new Document({
    title: model.title,
    footnotes,
    sections: [{ footers: { default: footer }, children: [...head, ...body] }],
  });
  return Packer.toBuffer(doc);
}
