import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    // 开发时把 /api 代理到后端，这样不设 VITE_API_URL 也能拿到链上画像
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
  optimizeDeps: {
    include: ['@xmtp/proto'],
    // XMTP 使用 Web Workers，预构建会报 workers/client 不存在，排除后由动态 import 按需加载
    exclude: ['@xmtp/browser-sdk', '@xmtp/wasm-bindings'],
  },
});
