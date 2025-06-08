import typescript from '@rollup/plugin-typescript';

export default [
  // CommonJS build
  {
    input: 'src/useStatefulUrl.ts',
    output: {
      file: 'dist/useStatefulUrl.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    external: ['react'],
    plugins: [
      typescript({ 
        tsconfig: 'tsconfig.build.json',
        declaration: false,
        declarationMap: false,
        sourceMap: true,
        inlineSources: true
      })
    ],
  },
  
  // ES Module build with TypeScript declarations
  {
    input: 'src/useStatefulUrl.ts',
    output: {
      file: 'dist/useStatefulUrl.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    external: ['react'],
    plugins: [
      typescript({ 
        tsconfig: 'tsconfig.build.json',
        declaration: true,
        declarationMap: true,
        declarationDir: 'dist',
        sourceMap: true,
        inlineSources: true
      })
    ],
  },
  
  // UMD build for browsers/unpkg
  {
    input: 'src/useStatefulUrl.ts',
    output: {
      file: 'dist/useStatefulUrl.umd.js',
      format: 'umd',
      name: 'useStatefulUrl',
      globals: {
        react: 'React',
      },
      sourcemap: true,
    },
    external: ['react'],
    plugins: [
      typescript({ 
        tsconfig: 'tsconfig.build.json',
        declaration: false,
        declarationMap: false,
        sourceMap: true,
        inlineSources: true
      })
    ],
  },
]; 