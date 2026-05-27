import { defineConfig } from "vite";

const isPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isPages ? "/domswp-playground/threejs-orbit/" : "./",
  server: { port: 5173 },
});
