/// <reference types="vite/client" />

interface Window {
  gtag?: (command: string, action: string, params?: any) => void;
}

interface ImportMetaEnv {
  readonly BASE_URL: string
  // 可以添加其他环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}