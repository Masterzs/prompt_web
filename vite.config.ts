import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 根据环境变量设置 base 路径
// 支持多种部署场景：
// 1. GitHub Actions: 自动检测仓库名
// 2. 手动指定: 通过 VITE_BASE_PATH 环境变量
// 3. 本地开发: 使用根路径 /
const getBasePath = () => {
  // GitHub Actions 自动检测
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    // 如果是 username.github.io 格式，使用根路径
    if (repoName.endsWith('.github.io')) {
      return '/'
    }
    return `/${repoName}/`
  }

  // 手动指定路径（优先级最高）
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH
  }

  // 默认：开发环境用根路径，生产环境用仓库名
  return process.env.NODE_ENV === 'production' ? '/prompt_web/' : '/'
}

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})