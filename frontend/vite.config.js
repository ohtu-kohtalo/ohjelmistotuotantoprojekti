import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./testSetup.js",
    coverage: {
      exclude: [
        "src/main.jsx",
        "eslint.config.js",
        "vite.config.js"
      ]
    }
  },
  server: {
    allowedHosts: ["frontend-future-customer.2.rahtiapp.fi"],
  },
});
