/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __CONTENT_STRICT__: boolean;

/** The demo chapter's data files, served by texts.vite.ts from texts.config.json. */
declare module 'virtual:texts' {
  export const units: unknown;
  export const schedule: unknown;
  export const unitContent: unknown;
  export const glossary: unknown;
  export const portion: unknown;
  export const translations: unknown;
}

interface ImportMetaEnv {
  readonly VITE_FEATURE_SHINUN?: string;
}
