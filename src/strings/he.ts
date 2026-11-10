// All UI strings (SPEC §4.4), in one place for review. Chabad terminology: ביאור, שיעור, לימוד.
// The name is written חי, without gershayim.

import type { Source } from '../domain/types.ts';

const days = (n: number) => (n === 1 ? 'יום אחד' : `${n} ימים`);

const contentCredit =
  'הביאור, המילון, השאלות והכלים ללימוד אבות ובנים נכתבו עבור תניא חי. כל הזכויות שמורות.';

/** The title and description of each level in app.config.json, by level ID. */
const levelOptions: Record<number, { title: string; description: string }> = {
  1: { title: 'טקסט בלבד', description: 'קוראים את לשון התניא כפי שהיא' },
  2: { title: 'טקסט עם ביאור', description: 'ביאור קצר ופשוט אחרי כל משפט' },
};

export const he = {
  appName: { tanya: 'תניא', chai: 'חי', full: 'תניא חי' },

  common: {
    back: 'חזרה',
    close: 'סגירה',
    next: 'הבא',
    prev: 'הקודם',
    menu: 'אפשרויות נוספות',
    demoData: 'נתון להדגמה',
  },

  home: {
    estimatedTime: (minutes: number) => `כ־${minutes} דקות`,
    streak: (n: number) => `רצף: ${days(n)}`,
    start: 'התחל ללמוד',
    together: 'לימוד אבות ובנים',
    about: 'אודות תניא חי',
  },

  level: {
    title: 'איך תרצו ללמוד היום?',
    options: levelOptions,
    selected: 'הבחירה האחרונה',
    maskil: 'ללימוד מעמיק עם מפרשים: מסלול משכיל, בקרוב',
  },

  read: {
    backToLevel: 'חזרה לבחירת אופן הלימוד',
    progress: 'התקדמות הקריאה',
    toQuestions: 'לשאלות',
    englishChip: 'EN',
    englishShow: 'הצגת התרגום לאנגלית של פסקה זו',
    englishHide: 'הסתרת התרגום לאנגלית של פסקה זו',
    englishAllShow: 'הצגת התרגום לאנגלית בכל הפסקאות',
    englishAllHide: 'הסתרת התרגום לאנגלית בכל הפסקאות',
    biurLabel: 'ביאור',
    glossaryHint: 'הקישו על מילה מסומנת לביאור',
    footnote: (n: string) => `הערה ${n}`,
    footnoteTitle: 'הערה',
  },

  glossary: {
    source: 'מקור',
  },

  quiz: {
    title: 'שאלות על השיעור',
    progress: (i: number, n: number) => `שאלה ${i} מתוך ${n}`,
    backToText: 'חזרה לטקסט',
    textSheetTitle: 'לשון התניא',
    true: 'נכון',
    false: 'לא נכון',
    findSentenceHelp: 'הקישו על המשפט בטקסט',
    praise: ['יפה מאוד', 'בדיוק', 'נכון מאוד', 'כל הכבוד'],
    tryAgain: 'כמעט. נסו שוב:',
    revealed: 'התשובה הנכונה:',
    fromText: 'מתוך הטקסט',
    next: 'לשאלה הבאה',
    finish: 'לסיום השיעור',
    points: (n: number) => `+${n}`,
    chosenWrong: 'תשובה שנבחרה',
  },

  done: {
    headline: 'סיימת את שיעור היום!',
    headlineTogether: 'סיימתם את השיעור יחד!',
    streakLabel: 'רצף',
    familyStreakLabel: 'רצף משפחתי',
    streakDays: (n: number) => (n === 1 ? 'יום' : 'ימים'),
    streakRule: 'הרצף נשמר בשבת ובחג, ואת השיעור משלימים במוצאי שבת',
    pointsWord: 'נקודות',
    pointsDetail: (earned: number, bonus: number) =>
      `${earned} על השאלות ו־${bonus} על סיום השיעור`,
    pointsAlready: 'על רמה זו כבר התקבלו נקודות, ולכן הפעם לא נוספו',
    pointsAlreadyTogether: 'על לימוד אבות ובנים כבר התקבלו נקודות, ולכן הפעם לא נוספו',
    communityLabel: 'כל הלומדים יחד השבוע:',
    communityUnit: 'שיעורים',
    heartLine: 'הקו המוזהב מקיף את הלב ככל שמתקדמים בלימוד',
    heartLabel: (p: number) => `התקדמות בלימוד: ${p}%`,
    otherLevel: 'נסה רמה אחרת',
    together: 'לימוד אבות ובנים',
    shinun: 'טעימה משינון',
    about: 'אודות',
    home: 'למסך הבית',
  },

  together: {
    title: 'לימוד אבות ובנים',
    intro: 'האב קורא, מסביר ושואל, והילד עונה. כל מה שצריך לומר כתוב כאן.',
    start: 'מתחילים',
    cardOf: (i: number, n: number) => `מחשבה ${i} מתוך ${n}`,
    forParent: 'לאבא',
    toChild: 'לומר לילד',
    talk: 'שאלה לשיחה',
    childTurn: 'עכשיו תורו של הילד',
    childTurnText: 'שלוש שאלות קצרות. הילד קורא ועונה, ואבא עוזר אם צריך.',
    toChildQuestions: 'לשאלות של הילד',
    backToCards: 'חזרה למחשבות',
  },

  togetherQuiz: {
    title: 'השאלות של הילד',
    correct: ['נכון, יפה מאוד!', 'כל הכבוד!', 'בדיוק כך!'],
    tryAgain: 'ננסה שוב?',
    fatherSaid: 'מה שאבא אמר:',
    fromText: 'מתוך התניא:',
    next: 'לשאלה הבאה',
    finish: 'לסיום',
    points: (n: number) => `+${n}`,
  },

  shinun: {
    title: 'טעימה משינון',
    readAloud: 'קראו בקול',
    round: (i: number, n: number) => `סבב ${i} מתוך ${n}`,
    roundZero: 'קראו את המשפט כולו',
    roundHidden: 'השלימו בעל פה. הקישו על מילה כדי לראות אותה.',
    success: 'הצלחתי',
    again: 'עוד פעם',
    finishedTitle: 'יפה מאוד!',
    finishedNote:
      'מסלול השינון המלא עובד בעיקר בשמיעה, דרך קו טלפון כשר, ומיועד לבתי ספר ולתלמודי תורה.',
    hiddenWord: 'מילה מוסתרת, הקישו לגילוי',
    home: 'למסך הבית',
  },

  about: {
    title: 'אודות תניא חי',
    what: [
      'תניא חי מלווה את הלימוד היומי בספר התניא, לפי חלוקת ״היום יום״.',
      'בכל יום: לשון התניא, ביאור קצר ושאלות, כל אחד לפי דרכו.',
      'המטרה: חיות בלימוד ובהבנה, לכל גיל.',
    ],
    pathsTitle: 'המסלולים',
    paths: [
      { name: 'מתמיד', text: 'השיעור היומי, עם ביאור קצר ושאלות.' },
      { name: 'לימוד אבות ובנים', text: 'כלים מוכנים לאב שלומד את השיעור עם בנו.' },
      { name: 'משכיל', text: 'לימוד מעמיק עם המפרשים. בקרוב.' },
      { name: 'שינון', text: 'מסלול משני: לימוד בעל פה, בעיקר בשמיעה.' },
    ],
    sourcesTitle: 'מקורות וזכויות',
    licenseLink: 'נוסח הרישיון',
    contentCredit,
    contactTitle: 'יצירת קשר',
    contact: '[TO FILL BY ALEX]',
    resetTitle: 'התחלה מחדש',
    reset: 'התחל מחדש',
    resetConfirm: 'כל ההתקדמות בהדגמה תתאפס. להמשיך?',
    resetYes: 'כן, לאפס',
    resetNo: 'ביטול',
    resetDone: 'ההדגמה אופסה',
    version: (v: string, date: string) => `גרסה ${v}, נבנתה ב־${date}`,
    draft: 'טיוטה',
    draftNote: (n: number) => `${n} פריטי תוכן עדיין ממתינים לאישור`,
  },

  print: {
    title: 'ביאור משולב',
    legend: { text: 'לשון התניא באותיות מודגשות', biur: 'והביאור באותיות רגילות' },
    draft: 'טיוטה: הביאור עדיין ממתין לאישור.',
    page: 'עמוד',
    /** The Hebrew sources carry their own Hebrew attribution. */
    sourceCredit: (s: Source) => s.attribution,
    contentCredit,
  },

  error: {
    title: 'משהו לא נטען כראוי',
    text: 'אפשר לנסות שוב. אם זה חוזר, נסו מאוחר יותר.',
    retry: 'נסו שוב',
  },
} as const;
