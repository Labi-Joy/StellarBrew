/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TIP_JAR_ADDRESS: string
  readonly VITE_TIP_JAR_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
