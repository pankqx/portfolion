import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// relative base so the same build works on GitHub Pages (/portfolion/) or any host
export default defineConfig({
  base: './',
  plugins: [react()],
})
