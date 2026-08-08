import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      // noVNC compatibility fix - use core/rfb-polyfill instead of core/rfb
      '@novnc/novnc/core/rfb': '@novnc/novnc/core/rfb-polyfill.js',
    },
  },
  optimizeDeps: {
    exclude: ['@novnc/novnc'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
