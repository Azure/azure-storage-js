import nodeResolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import globals from 'rollup-plugin-node-globals';

export default [
  {
    external: ['ms-rest-js', 'crypto', 'fs', 'events', 'os'],
    input: 'dist-esm/lib/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [nodeResolve({ module: true }), uglify()]
  },
  {
    external: ['ms-rest-js'],
    input: 'dist-esm/lib/index.browser.js',
    output: {
      globals: {
        'ms-rest-js': 'msRest'
      },
      file: 'dist/index.browser.js',
      format: 'umd',
      name: 'azblob',
      sourcemap: true
    },
    plugins: [
      replace({
        delimiters: ['', ''],
        values: {
          // replace dynamic checks with if (false) since this is for
          // browser only. Rollup's dead code elimination will remove
          // any code guarded by if (isNode) { ... }
          'if (isNode)': 'if (false)'
        }
      }),
      globals(),
      builtins(),
      nodeResolve({
        module: true,
        browser: true
      }),
      uglify()
    ]
  }
];
