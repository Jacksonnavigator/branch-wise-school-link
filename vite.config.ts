import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    preview: {
      allowedHosts: ["branch-wise-school-link.onrender.com"]
    },
    plugins: [
      react(),
  // componentTagger removed
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Production optimizations
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction, // Disable source maps in production for security
      rollupOptions: {
        output: {
          // Optimize chunk splitting
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Optimize asset handling
      assetsInlineLimit: 4096,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
