// Every route of the app, named once.
import type { Track } from './domain/types';

export const ROUTES = {
  home: '/',
  level: '/level',
  read: '/read',
  quiz: '/quiz',
  done: '/done',
  together: '/together',
  togetherQuiz: '/together/quiz',
  shinun: '/shinun',
  about: '/about',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

export const quizRoute = (track: Track): Route =>
  track === 'solo' ? ROUTES.quiz : ROUTES.togetherQuiz;
