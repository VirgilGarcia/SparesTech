import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement depuis la racine du monorepo
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  
  return {
    plugins: [react()],
    envDir: path.resolve(__dirname, '..'), // Pointer vers la racine
    define: {
      // Explicitement définir les variables pour Vite
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    }
  }
})
