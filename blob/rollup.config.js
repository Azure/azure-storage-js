import localResolve from 'rollup-plugin-local-resolve';
import nodeResolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default [
  {
    external: ['ms-rest-js', 'crypto', 'fs', 'events', 'os'],
    input: 'dist-esm/lib/index.js',
    output: {
      globals: {
        'ms-rest-js': 'msRest'
      },
      file: 'dist/index.js',
      format: 'umd',
      name: 'Microsoft.Azure.Storage.BlobService',
      sourcemap: true
    },
    plugins: [
      localResolve(),
      nodeResolve({ module: true, only: ['tslib'] }),
      uglify()
    ]
  }
];
