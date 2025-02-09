import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';

dotenv.config();

console.log("Running from vite.config.js");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY)
  }
})
