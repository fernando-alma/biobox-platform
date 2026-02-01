import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      // Esto ayuda a que Cornerstone encuentre el parser correctamente
      'dicom-parser': 'dicom-parser/dist/dicomParser.min.js',
    }
  },
  optimizeDeps: {
    include: [
      'cornerstone-core',
      'cornerstone-wado-image-loader',
      'dicom-parser'
    ]
  }
})