import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/FlashMessage.tsx", 
  output: [
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
  ],
  external: ["react", "react-dom"], 
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: true,
      jsx: "react", // Handle JSX
    }),
  ],
});