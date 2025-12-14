import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // 关键配置：GitHub Pages 部署必须设置 base 路径
  // 仓库名是 prompt_web，所以 base 设置为 '/prompt_web/'
  // 注意：前后都要有斜杠
  // 这是 GitHub Pages 部署的关键配置，必须设置！
  base: '/prompt_web/',
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