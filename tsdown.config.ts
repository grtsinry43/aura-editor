import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'tailwind-preset': 'src/tailwind-preset.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  deps: {
    neverBundle: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
  },
})
