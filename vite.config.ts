import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use relative base in production so assets load correctly on GitHub Pages paths.
  const repoBase = process.env.VITE_BASE ?? './';
  return {
    base: mode === 'development' ? '/' : repoBase,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
