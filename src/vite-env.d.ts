/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SURREAL_ENDPOINT: string;
  readonly VITE_SURREAL_NS: string;
  readonly VITE_SURREAL_DB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
