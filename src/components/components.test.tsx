import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { assemblePortion } from '../domain/portion';
import { navigate } from '../router';
import { he } from '../strings/he';
import { portionData } from '../test/fixtures';
import { BidiText } from './BidiText';
import { BottomSheet } from './BottomSheet';
import { EnglishText } from './EnglishText';
import { ErrorBoundary } from './ErrorBoundary';
import { GlossarySheet } from './GlossarySheet';
import { HeartMark } from './HeartMark';
import { CompactText, QuoteCard } from './PortionText';
import { ProgressDots } from './ProgressDots';
import { SentenceText } from './Sentence';
import { TopBar } from './TopBar';
import { Wordmark } from './Wordmark';

vi.mock('../router', async (original) => ({
  ...(await original<typeof import('../router')>()),
  navigate: vi.fn(),
}));

const portion = assemblePortion(portionData());
const unit = portion.unit('LA.1.001')!;
const entry = portionData().glossary[0]!;

afterEach(() => vi.useRealTimers());

describe('BidiText', () => {
  it('isolates Latin runs in <bdi>', () => {
    const { container } = render(
      <BidiText text="רישיון CC-BY-NC, באמצעות Kehot Publication Society Sefaria." />,
    );
    const bdis = [...container.querySelectorAll('bdi')];
    expect(bdis.map((b) => [b.textContent, b.className])).toEqual([
      ['CC-BY-NC', 'nowrap'],
      ['Kehot Publication Society Sefaria', ''],
    ]);
  });
});

describe('EnglishText', () => {
  it('turns footnote marks into buttons', () => {
    const onFootnote = vi.fn();
    const span = portion.paragraphs[0]!.translation!;
    const { container } = render(<EnglishText span={span} onFootnote={onFootnote} />);
    fireEvent.click(screen.getByRole('button', { name: he.read.footnote('1') }));
    expect(onFootnote).toHaveBeenCalledWith('1');
    expect(container.textContent).toBe('Love [and soul]1.');
  });

  it('shows a span without footnotes as text', () => {
    const span = portion.paragraphs[1]!.translation!;
    const { container } = render(<EnglishText span={span} onFootnote={vi.fn()} />);
    expect(container.textContent).toBe('Brothers.');
  });
});

describe('SentenceText', () => {
  it('makes each term a button when it can be opened', () => {
    const onTerm = vi.fn();
    render(<SentenceText unit={unit} onTerm={onTerm} />);
    fireEvent.click(screen.getByRole('button', { name: 'אַהֲבָה' }));
    expect(onTerm).toHaveBeenCalledWith(entry);
  });

  it('keeps the term as text otherwise, with the sentence unchanged', () => {
    const { container } = render(<SentenceText unit={unit} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.textContent).toBe(unit.display);
  });
});

describe('PortionText', () => {
  it('quotes one sentence', () => {
    const sentence = portion.sentenceOf(unit.id)!;
    render(<QuoteCard sentence={sentence} label="מתוך" />);
    expect(screen.getByText('מתוך')).toBeTruthy();
    render(<QuoteCard sentence={sentence} />);
    expect(screen.getAllByText(unit.display)).toHaveLength(2);
  });

  it('shows the text compact, with highlights', () => {
    const { container } = render(
      <CompactText
        paragraphs={portion.paragraphs}
        highlight="LA.1.002"
        highlightParagraph="LA.1.2"
      />,
    );
    expect(container.querySelector('.compact-sentence--highlight')?.textContent).toContain(
      'שׁוֹרֶשׁ',
    );
    expect(container.querySelectorAll('.compact-paragraph--hint')).toHaveLength(1);
  });

  it('makes each sentence a button with its state when it can be selected', () => {
    const onSelect = vi.fn();
    render(
      <CompactText
        paragraphs={portion.paragraphs}
        states={{ 'LA.1.002': 'wrong' }}
        onSelect={onSelect}
      />,
    );
    const wrong = screen.getByRole('button', { name: portion.unit('LA.1.002')!.display });
    expect(wrong.className).toContain('compact-sentence--wrong');
    expect(wrong.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(wrong);
    expect(onSelect).toHaveBeenCalledWith('LA.1.002');
  });
});

describe('BottomSheet', () => {
  it('opens as a dialog, closes on Escape and the backdrop, and gives back focus', () => {
    const onClose = vi.fn();
    const onOpened = vi.fn();
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const { rerender } = render(
      <BottomSheet open onClose={onClose} title="כותרת" tall onOpened={onOpened}>
        <p>תוכן</p>
      </BottomSheet>,
    );
    expect(screen.getByRole('dialog', { name: 'כותרת' }).className).toContain('sheet--tall');
    expect(onOpened).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.click(document.querySelector('.sheet-backdrop')!);
    fireEvent.click(screen.getByRole('button', { name: he.common.close }));
    expect(onClose).toHaveBeenCalledTimes(3);
    rerender(
      <BottomSheet open={false} onClose={onClose} title={<span>x</span>}>
        <p>תוכן</p>
      </BottomSheet>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe('');
    opener.remove();
  });

  it('labels the dialog only with a text title', () => {
    render(
      <BottomSheet open onClose={vi.fn()} title={<span>x</span>}>
        <p />
      </BottomSheet>,
    );
    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBeNull();
  });
});

describe('GlossarySheet', () => {
  it('shows the entry with its source', () => {
    render(<GlossarySheet entry={entry} onClose={vi.fn()} />);
    expect(screen.getByText(entry.body.value)).toBeTruthy();
    expect(screen.getByText(`${he.glossary.source}: ${entry.source}`)).toBeTruthy();
  });

  it('shows an entry without a source, and nothing when closed', () => {
    const { rerender } = render(
      <GlossarySheet entry={portionData().glossary[1]!} onClose={vi.fn()} />,
    );
    expect(document.querySelector('.glossary-source')).toBeNull();
    rerender(<GlossarySheet entry={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('HeartMark', () => {
  const contour = () => document.querySelector('.heartmark-contour') as SVGPathElement;

  it('draws the progress, clamped, labeled or hidden', () => {
    const { rerender } = render(<HeartMark progress={140} label="לב" />);
    expect(screen.getByRole('img', { name: 'לב' })).toBeTruthy();
    expect(contour().style.strokeDashoffset).toBe('0');
    rerender(<HeartMark progress={-5} />);
    expect(document.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(contour().style.opacity).toBe('0');
  });

  it('draws in from 0 when animated, then beats and warms', async () => {
    vi.useFakeTimers();
    render(<HeartMark progress={60} animated drawIn beating purify />);
    expect(contour().style.strokeDashoffset).toBe('100');
    await act(async () => void vi.advanceTimersByTime(100));
    expect(contour().style.strokeDashoffset).toBe('40');
    expect(document.querySelector('.heartmark-beat')).toBeTruthy();
    expect(document.querySelector('.heartmark-purify')).toBeTruthy();
    expect(document.querySelector('svg')!.getAttribute('style')).toContain('--heart-contour-ms');
  });

  it('cancels its frames when unmounted early', () => {
    const { unmount } = render(<HeartMark progress={60} animated />);
    unmount();
  });
});

describe('small components', () => {
  it('ProgressDots marks done and current', () => {
    const { container } = render(<ProgressDots count={3} current={1} />);
    expect([...container.querySelectorAll('.progress-dot')].map((d) => d.className)).toEqual([
      'progress-dot progress-dot--done',
      'progress-dot progress-dot--current',
      'progress-dot',
    ]);
  });

  it('TopBar goes back', () => {
    render(<TopBar back="/level" title="כותרת" end={<i>end</i>} />);
    fireEvent.click(screen.getByRole('button', { name: he.common.back }));
    expect(navigate).toHaveBeenCalledWith('/level');
  });

  it('Wordmark writes the name', () => {
    const { container } = render(<Wordmark as="p" />);
    expect(container.querySelector('p')!.textContent).toBe(he.appName.full);
  });

  it('ErrorBoundary shows a retry screen that reloads', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reload = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ reload } as never);
    const Boom = () => {
      throw new Error('boom');
    };
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: he.error.retry }));
    expect(reload).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
