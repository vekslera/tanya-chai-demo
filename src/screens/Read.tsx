import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { EnglishText } from '../components/EnglishText';
import { GlossarySheet } from '../components/GlossarySheet';
import { MoreIcon } from '../components/Icons';
import { SentenceText } from '../components/Sentence';
import { TopBar } from '../components/TopBar';
import { usePortion } from '../content/PortionContext';
import type { GlossaryEntry, TranslationSpan } from '../content/types';
import { useStore } from '../store/store';
import { useStartQuiz } from '../store/useStartQuiz';
import { he } from '../strings/he';
import './Read.css';

const UNLOCK_AFTER_MS = 20_000;

export function ReadScreen() {
  const { state, dispatch } = useStore();
  const { portion, paragraphs, units } = usePortion();
  const startQuiz = useStartQuiz();
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  const [timeUp, setTimeUp] = useState(false);
  const [term, setTerm] = useState<GlossaryEntry | null>(null);
  const [footnote, setFootnote] = useState<{ span: TranslationSpan; n: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);

  const spans = paragraphs.flatMap((p) => (p.translation ? [p.translation] : []));
  const spanIds = spans.map((s) => s.from);
  const allEnglishOpen = spanIds.length > 0 && spanIds.every((id) => state.englishOpen[id]);
  const lastUnit = units[units.length - 1]!.id;
  const unlocked = timeUp || seen.has(lastUnit);

  useEffect(() => {
    const t = window.setTimeout(() => setTimeUp(true), UNLOCK_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Reading progress: one observer entry per sentence (SPEC §7).
  useEffect(() => {
    const els = body.current?.querySelectorAll<HTMLElement>('[data-unit]') ?? [];
    if (!('IntersectionObserver' in window)) {
      setSeen(new Set(units.map((u) => u.id)));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        if (visible.length === 0) return;
        setSeen((prev) => {
          const next = new Set(prev);
          for (const el of visible) next.add(el.dataset.unit!);
          return next;
        });
        for (const el of visible) io.unobserve(el);
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [units, state.level]);

  const progress = Math.round((seen.size / units.length) * 100);

  return (
    <main className="screen read">
      <TopBar
        back="/level"
        backLabel={he.read.backToLevel}
        title={portion.label.he}
        end={
          spanIds.length > 0 && (
            <div className="menu">
              <button
                type="button"
                className="icon-btn"
                aria-label={he.common.menu}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <MoreIcon />
              </button>
              {menuOpen && (
                <>
                  <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
                  <div className="menu-popover" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        dispatch({ type: 'setAllEnglish', spanIds, open: !allEnglishOpen });
                        setMenuOpen(false);
                      }}
                    >
                      {allEnglishOpen ? he.read.englishAllHide : he.read.englishAllShow}
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        }
      >
        <div
          className="read-progress"
          role="progressbar"
          aria-label={he.read.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="read-progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </TopBar>

      <p className="read-location">{portion.location.he}</p>

      <div ref={body} className="read-body">
        {paragraphs.map((p) => {
          const span = p.translation;
          const open = span ? !!state.englishOpen[span.from] : false;
          return (
            <section key={p.paragraph} className="paragraph">
              {span && (
                <div className="paragraph-tools">
                  <button
                    type="button"
                    className={`en-chip${open ? ' en-chip--open' : ''}`}
                    aria-pressed={open}
                    aria-label={open ? he.read.englishHide : he.read.englishShow}
                    onClick={() => dispatch({ type: 'toggleEnglish', spanId: span.from })}
                  >
                    <bdi>{he.read.englishChip}</bdi>
                  </button>
                </div>
              )}
              {p.units.map((u) => (
                <div key={u.id} className="sentence-block" data-unit={u.id}>
                  <p className="sentence">
                    <SentenceText unit={u} onTerm={setTerm} />
                  </p>
                  {state.level === 2 && u.biur && <p className="biur">{u.biur.value}</p>}
                </div>
              ))}
              {span && open && (
                <p className="english" dir="ltr" lang="en">
                  <EnglishText span={span} onFootnote={(n) => setFootnote({ span, n })} />
                </p>
              )}
            </section>
          );
        })}
      </div>

      <div className="bottom-bar">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!unlocked}
          onClick={() => startQuiz('solo', state.level)}
        >
          {he.read.toQuestions}
        </button>
      </div>

      <GlossarySheet entry={term} onClose={() => setTerm(null)} />
      <BottomSheet
        open={footnote !== null}
        onClose={() => setFootnote(null)}
        title={footnote ? he.read.footnote(footnote.n) : ''}
      >
        {footnote && (
          <p className="english english--note" dir="ltr" lang="en">
            {footnote.span.footnotes?.[footnote.n]}
          </p>
        )}
      </BottomSheet>
    </main>
  );
}
