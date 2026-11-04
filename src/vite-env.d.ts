/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __CONTENT_STRICT__: boolean;

interface ImportMetaEnv {
  readonly VITE_FEATURE_SHINUN?: string;
}
