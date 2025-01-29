import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  clean: true,
  dts: true,
  format: ["cjs", "esm", 'iife'],
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
