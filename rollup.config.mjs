import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/index.ts", 
  output: [
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
      exports: "named"
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
      exports: "named"
    },
  ],
  external: ["react", "react-dom"], 
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: true,
      jsx: "react", 
    }),
  ],
});