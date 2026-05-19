import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars for the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Set base path — use "/" for root deployments, change if deploying to a subdirectory
    base: "/",

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },

    build: {
      // Output directory
      outDir: "dist",

      // Generate sourcemaps for debugging production issues
      sourcemap: true,

      // Warn if a chunk exceeds 500 KB
      chunkSizeWarningLimit: 500,

      rollupOptions: {
        output: {
          // Split vendor libraries into separate chunks for better caching
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: [
              "lucide-react",
              "class-variance-authority",
              "clsx",
              "tailwind-merge",
            ],
            data: [
              "@tanstack/react-query",
              "axios",
              "zustand",
              "zod",
              "react-hook-form",
            ],
          },
        },
      },

      // Minification
      minify: "terser",
      terserOptions: {
        compress: {
          // Remove console.log in production (keeps console.warn and console.error)
          pure_funcs: ["console.log"],
        },
      },
    },

    // Preview server (for testing production builds locally via `npm run preview`)
    preview: {
      port: 5173,
    },
  };
});
