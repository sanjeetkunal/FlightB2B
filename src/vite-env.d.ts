/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AVIATIONSTACK_KEY: string;
  // yahan aur env vars add kar sakte ho:
  // readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
