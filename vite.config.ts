import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 根据环境变量设置 base 路径
// 优先级：VITE_BASE_PATH > GITHUB_REPOSITORY > 默认值
const getBasePath = () => {
  // 1. 优先使用手动指定的环境变量
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH
  }
  
  // 2. 如果在 GitHub Actions 中，从 GITHUB_REPOSITORY 获取仓库名
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    // 如果是 username.github.io 格式，使用根路径
    if (repoName.endsWith('.github.io')) {
      return '/'
    }
    return `/${repoName}/`
  }
  
  // 3. 默认值：生产环境使用 '/prompt_web/'，开发环境使用 '/'
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