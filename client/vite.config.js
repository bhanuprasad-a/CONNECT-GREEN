import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['maplibre-gl'],
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            }
        }
    },
    build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('maplibre-gl') || id.includes('react-map-gl')) {
                            return 'vendor-map';
                        }
                        if (id.includes('recharts')) {
                            return 'vendor-charts';
                        }
                        if (id.includes('framer-motion')) {
                            return 'vendor-motion';
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) {
                            return 'vendor-react';
                        }
                    }
                }
            }
        }
    }
})
