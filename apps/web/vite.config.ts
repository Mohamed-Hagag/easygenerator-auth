import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
   plugins: [react(), tailwindcss()],
   resolve: {
      // Use the `paths` in tsconfig.app.json as the single source of truth for import aliases.
      tsconfigPaths: true,
   },
   server: {
      // The API only accepts writes from WEB_ORIGIN, so the port must not change silently.
      port: 5173,
      strictPort: true,
      // Same origin for the browser, so the session cookies work without CORS.
      proxy: { '/api': 'http://localhost:3000' },
   },
   // Same port for the same reason; the proxy is inherited from `server`.
   preview: { port: 5173, strictPort: true },
});
