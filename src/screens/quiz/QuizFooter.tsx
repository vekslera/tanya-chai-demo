import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { CompactText } from '../../components/PortionText';
import { usePortion } from '../../content/PortionProvider';
import { canAnswer } from '../../domain/quiz';
import { he } from '../../strings/he';
import type { QuizSessionView } from './useQuizSession';

/** Back to the text (in a sheet) and, once the question is done, on to the next one. */
export function QuizFooter({ session, onNext }: { session: QuizSessionView; onNext: () => void }) {
  const { paragraphs } = usePortion();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { question: q, phase, isLast, sentence } = session;
  const open = canAnswer(phase);
  // While a findSentence question is open, the sheet must not point at the answer.
  const highlight = q.kind === 'findSentence' && open ? undefined : sentence.id;

  return (
    <>
      <div className="quiz-footer">
        <button type="button" className="link-btn" onClick={() => setSheetOpen(true)}>
          {he.quiz.backToText}
        </button>
        {!open && (
          <button type="button" className="btn btn-primary btn-block" onClick={onNext}>
            {isLast ? he.quiz.finish : he.quiz.next}
          </button>
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={he.quiz.textSheetTitle}
        tall
        onOpened={(body) => {
          if (!highlight) return;
          body.querySelector(`[data-unit="${highlight}"]`)?.scrollIntoView({ block: 'center' });
        }}
      >
        <CompactText paragraphs={paragraphs} highlight={highlight} />
      </BottomSheet>
    </>
  );
}
