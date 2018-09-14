import localResolve from 'rollup-plugin-local-resolve';
import nodeResolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';

export default [
  {
    external: ['ms-rest-js', 'crypto', 'fs', 'events', 'os'],
    input: 'dist-esm/lib/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      name: 'Microsoft.Azure.Storage.BlobService',
      sourcemap: true
    },
    plugins: [
      localResolve(),
      nodeResolve({ module: true, only: ['tslib'] }),
      uglify()
    ]
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
      name: 'azBlob',
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
      localResolve(),
      nodeResolve({
        module: true,
        browser: true,
        only: ['tslib']
      }),
      builtins(),
      uglify()
    ]
  }
];
