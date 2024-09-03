import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      overrides: {
        crypto: "crypto-browserify",
      },
    }),
    dts({
      tsconfigPath: path.resolve(__dirname, './tsconfig.app.json'), // Point to the correct tsconfig
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  build: {
    target: "es6",
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    lib: {
      formats: ["es", "cjs"],
      entry: path.resolve("src/index.ts"),
      name: "@withton/bridge",
      fileName: (format) => {
        switch (format) {
          case "es":
            return "index.mjs";
          case "cjs":
            return "index.cjs";
          default:
            throw new Error("Unknown format");
        }
      },
    },
  },
});
