// The print style: colors and size proportions come from the design tokens (tokens.css), the fonts
// and the base size from the print section of app.config.json.
import type { PrintLanguage } from '../config.ts';

export type RunStyle = { font: string; color: string; sizePt: number; bold: boolean };

export type PrintStyle = Record<'text' | 'biur' | 'title' | 'note' | 'draft', RunStyle>;

/** The custom properties of a stylesheet, with their var() references resolved. */
export function cssVars(css: string): Map<string, string> {
  const raw = new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!]));
  const resolve = (value: string): string =>
    value.trim().replace(/var\((--[\w-]+)\)/g, (_, name: string) => resolve(token(raw, name)));
  return new Map([...raw].map(([name, value]) => [name, resolve(value)]));
}

function token(vars: Map<string, string>, name: string): string {
  const value = vars.get(name);
  if (value === undefined) throw new Error(`tokens.css: ${name} is not defined`);
  return value;
}

/** `name`, checked to be one of the families of a font stack. */
export function family(stack: string, name: string): string {
  const families = stack.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, ''));
  if (!families.includes(name)) throw new Error(`print: ${name} is not in the stack ${stack}`);
  return name;
}

/** A #rrggbb color as Word writes it. */
export function hex(color: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`print: ${color} is not a #rrggbb color`);
  return color.slice(1).toUpperCase();
}

export function printStyle(css: string, biurPt: number, { fonts }: PrintLanguage): PrintStyle {
  const vars = cssVars(css);
  const get = (name: string) => token(vars, name);
  const pt = (size: string) => (biurPt * parseFloat(get(size))) / parseFloat(get('--fs-biur'));
  const text = family(get('--font-text'), fonts.text);
  const biur = family(get('--font-ui'), fonts.biur);
  const navy = hex(get('--navy'));
  const muted = hex(get('--navy-muted'));
  return {
    text: { font: text, color: navy, sizePt: pt('--fs-tanya'), bold: true },
    biur: { font: biur, color: muted, sizePt: pt('--fs-biur'), bold: false },
    title: { font: text, color: navy, sizePt: pt('--fs-headline'), bold: true },
    note: { font: biur, color: muted, sizePt: pt('--fs-small'), bold: false },
    draft: { font: biur, color: hex(get('--gold-deep')), sizePt: pt('--fs-small'), bold: true },
  };
}
