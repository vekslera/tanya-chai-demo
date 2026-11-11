import { useState } from 'react';
import { MoreIcon } from '../../components/Icons';
import { he } from '../../strings/he';

/** The ⋮ menu of the Read screen: shows or hides the English of every paragraph at once. */
export function EnglishMenu({
  hasEnglish,
  allOpen,
  onSetAll,
}: {
  hasEnglish: boolean;
  allOpen: boolean;
  onSetAll: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!hasEnglish) return null;
  return (
    <div className="menu">
      <button
        type="button"
        className="icon-btn"
        aria-label={he.common.menu}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <MoreIcon />
      </button>
      {open && (
        <>
          <div className="menu-scrim" onClick={() => setOpen(false)} />
          <div className="menu-popover" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onSetAll(!allOpen);
                setOpen(false);
              }}
            >
              {allOpen ? he.read.englishAllHide : he.read.englishAllShow}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
