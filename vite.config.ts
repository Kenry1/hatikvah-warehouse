import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        const fs = require('fs');
        const path = require('path');
        const src = path.resolve(__dirname, '_redirects');
        const dest = path.resolve(__dirname, 'dist/_redirects');
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
