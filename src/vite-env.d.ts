/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __CONTENT_STRICT__: boolean;

/** The data files of every configured chapter (virtual.vite.ts). Per-chapter files by "LA.32". */
declare module 'virtual:texts' {
  export const units: Record<string, unknown>;
  export const translations: Record<string, unknown>;
  export const unitContent: Record<string, unknown>;
  export const schedule: unknown;
  export const glossary: unknown;
  export const portion: unknown;
}

/** app.config.json (virtual.vite.ts). Its shape is checked by src/config.test.ts. */
declare module 'virtual:app-config' {
  const config: unknown;
  export default config;
}

/** The heart's geometry, read from the animated logo at build time (virtual.vite.ts). */
declare module 'virtual:brand' {
  const geometry: import('../scripts/lib/brand').HeartGeometry;
  export default geometry;
}

interface ImportMetaEnv {
  readonly VITE_FEATURE_SHINUN?: string;
}
