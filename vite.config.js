import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localAdmin } from './server/local-admin.mjs';
export default defineConfig(({ mode }) => ({
  plugins: [react(), localAdmin()], // localAdmin sirf `vite` (dev) me chalta hai, build me nahi
  base: mode === 'tiiny' ? './' : (process.env.VITE_BASE || '/'),
}));
