/// <reference types="astro/client" />

declare module '*.yaml' {
  const value: unknown;
  export default value;
}
declare module '*.yml' {
  const value: unknown;
  export default value;
}

interface ImportMetaEnv {
  /** Set to "true" to render draft content and placeholders with visible badges (preview builds). */
  readonly PUBLIC_SHOW_DRAFTS?: string;
  /** "true" in PREVIEW_RELATIVE builds (file-per-page output, no client router). */
  readonly PUBLIC_PREVIEW_RELATIVE?: string;
}
