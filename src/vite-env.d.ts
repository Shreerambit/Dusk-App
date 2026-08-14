/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set only by the standalone single-file build; switches to hash routing. */
  readonly VITE_STANDALONE?: string | boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
