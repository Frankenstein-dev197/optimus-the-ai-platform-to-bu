import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // Mock noVNC core/rfb to avoid build errors
      '@novnc/novnc/core/rfb': resolve(__dirname, 'src/__mocks__/novnc-rfb.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@novnc/novnc'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['@novnc/novnc'],
    },
  },
})
