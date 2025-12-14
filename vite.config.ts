import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 根据环境变量设置 base 路径
// 如果设置了 GITHUB_REPOSITORY 环境变量，使用仓库名作为 base
// 否则根据 NODE_ENV 判断：生产环境默认使用 '/prompt_web/'，开发环境使用 '/'
const getBasePath = () => {
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    // 如果是 username.github.io 格式，使用根路径
    if (repoName.endsWith('.github.io')) {
      return '/'
    }
    return `/${repoName}/`
  }
  // 可以通过环境变量手动指定
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH
  }
  // 默认：生产环境使用仓库名，开发环境使用根路径
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