import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Rewrite Set-Cookie so the browser stores JSESSIONID on the dev origin
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
