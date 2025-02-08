import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import { loadEnv } from 'vite';

    export default defineConfig(({ mode }) => {
      const env = loadEnv(mode, process.cwd(), '');
      return {
        define: {
          'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        plugins: [react()],
      }
    })
