import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '')
  const targetPort = env.PORT || 8000
  const targetHost = env.HOST || 'localhost'

  return {
    envDir: '../',
    plugins: [react()],
    server: {
      proxy: {
        '/uploads': {
          target: `http://${targetHost}:${targetPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
