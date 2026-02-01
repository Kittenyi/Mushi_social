import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  optimizeDeps: {
    include: ['@xmtp/proto'],
    // XMTP 使用 Web Workers，预构建会报 workers/client 不存在，排除后由动态 import 按需加载
    exclude: ['@xmtp/browser-sdk', '@xmtp/wasm-bindings'],
  },
});
