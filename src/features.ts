/** Shinun taste (SPEC §3.1, S6): behind a build-time flag, off by default. */
export const SHINUN_ENABLED = import.meta.env.VITE_FEATURE_SHINUN === 'true';
