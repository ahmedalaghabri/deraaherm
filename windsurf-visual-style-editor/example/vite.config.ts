import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { transformAsync } from '@babel/core';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const visualStyleEditorPlugin = require('../babel-plugin/src/index.cjs');

export default defineConfig({
  plugins: [
    {
      name: 'visual-style-editor-instrumentation',
      apply: 'serve',
      enforce: 'pre',
      async transform(code, id) {
        if (!/\.[jt]sx$/.test(id) || id.includes('node_modules')) return null;
        const result = await transformAsync(code, {
          filename: id,
          sourceMaps: true,
          parserOpts: { plugins: ['jsx', 'typescript'] },
          plugins: [[visualStyleEditorPlugin, { root: process.cwd() }]],
          configFile: false,
          babelrc: false
        });
        return result?.code ? { code: result.code, map: result.map } : null;
      }
    },
    react()
  ]
});
