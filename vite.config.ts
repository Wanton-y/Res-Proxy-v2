import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      output: {
        comments: false, // 去除注释
      },
    },
    rollupOptions: {
      input: {
        index: 'index.html',
        service_worker: 'src/background/service_worker.ts',
        content_script: 'src/content/script.ts',
      },
      output: {
        dir: 'dist',
        format: 'es',
        entryFileNames: assetInfo => {
          if (assetInfo.name === 'service_worker') {
            return `background/[name].js`;
          }
          if (assetInfo.name === 'content_script') {
            return `content/[name].js`;
          }
          return `assets/[name]-[hash:8].js`;
        },
      },
    },
  },
  css: {},
});
