import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ESTA ES LA MAGIA: Obliga a Vite a usar una sola instancia de React
    dedupe: ['react', 'react-dom'],
  }
})