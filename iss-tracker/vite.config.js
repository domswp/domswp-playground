import { defineConfig } from "vite";

const isPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isPages ? "/domswp-playground/iss-tracker/" : "./",
  server: { port: 5174 },
});
