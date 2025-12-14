import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // 关键配置：GitHub Pages 部署必须设置 base 路径
  // 默认生产使用 '/prompt_web/'；本地如需根路径可设置 VITE_BASE_PATH='/'
  base: process.env.VITE_BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/prompt_web/' : '/'),
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