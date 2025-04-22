import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  external: ['@withton/bridge', 'ton'],
  target: 'es2020',
  platform: 'node',
  skipNodeModulesBundle: true,
  noExternal: ['@withton/bridge'],
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      'process.env.NODE_ENV': '"production"'
    };
    return options;
  }
}); 