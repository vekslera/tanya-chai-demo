// Every route of the app, named once.
import type { Track } from './domain/types';

export const ROUTES = {
  home: '/',
  level: '/level',
  read: '/read',
  done: '/done',
  together: '/together',
  shinun: '/shinun',
  about: '/about',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/** Where a track is learned, its questions included. */
export const trackRoute = (track: Track): Route =>
  track === 'solo' ? ROUTES.read : ROUTES.together;
