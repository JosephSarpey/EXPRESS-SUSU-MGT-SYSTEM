import { defineConfig, loadEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
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

    // Strips logs globally using ESBuild instead of Terser for 10x faster builds
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },

    build: {
      outDir: "dist",
      sourcemap: "hidden",
      chunkSizeWarningLimit: 200, // Target under 200KB chunks for optimal performance

      rollupOptions: {
        output: {
          // Aggressive manual chunk splitting for optimal browser caching
          manualChunks: {
            // Core React dependencies
            react: ["react", "react-dom"],
            "react-routing": ["react-router-dom"],
            
            // UI and styling
            ui: ["lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
            "radix-ui": ["radix-ui"],
            
            // Data fetching and state management
            "data-fetch": ["@tanstack/react-query", "axios"],
            state: ["zustand"],
            
            // Forms and validation
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],
            
            // Heavy libraries (separate to avoid main chunk bloat)
            animations: ["framer-motion"],
            charts: ["recharts"],
            icons: ["react-icons"],
            
            // Utilities
            dates: ["date-fns"],
            supabase: ["@supabase/supabase-js"],
            payments: ["react-paystack"],
            
            // Dev tools (only in dev, but nice to separate)
            "query-devtools": ["@tanstack/react-query-devtools"],
          },
        },
      },
    },

    preview: {
      port: 5173,
    },
  };
});
