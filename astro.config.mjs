// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    server: {
      allowedHosts: [
        'peers-module-abraham-verification.trycloudflare.com'
      ]
    }
  }
});
