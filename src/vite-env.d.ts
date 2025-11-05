/// <reference types="vite/client" />

interface ImportMetaEnv {
  // No Supabase environment variables needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
