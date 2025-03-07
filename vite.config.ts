import { defineConfig } from "vite";

import solidPlugin from "vite-plugin-solid";

const define = {
  BUILD_TIME: JSON.stringify(new Date().toISOString()),
  SERVICE_URL: JSON.stringify(
    process.env.SERVICE_URL ?? "http://localhost:4000"
  ),
};
for (const [k, v] of Object.entries(define)) {
  console.debug(`[vite define] ${k}:`, v);
}
// https://vitejs.dev/config/

export default defineConfig(({ mode }) => ({
  plugins: [solidPlugin()],
  base: mode === "production" ? "/genkit-mvp-app/" : "/",
  preview: {
    host: "localhost",
    port: 8080,
  },
  server: {
    host: "localhost",
    port: 8080,
  },
  // string values will be used as raw expressions, so if defining a string constant, it needs to be explicitly quoted
  define,
}));
