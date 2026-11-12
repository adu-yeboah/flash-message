import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  target: 'es2020',
  dts: true,
})