    import * as esbuild from 'esbuild-wasm';
    import unpkgPathPlugin from './plugins/unpkg-path-plugin';
    import fetchPlugin from './plugins/fetch-plugin';

    export const bundleCode = async (files) => {
      // Find entry file
      const entry = files['index.jsx'] ? 'index.jsx' : Object.keys(files)[0];

      const result = await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(), fetchPlugin(files)],
        define: {
          'process.env.NODE_ENV': '"production"',
          global: 'window',
        },
        jsx: 'automatic',
        jsxImportSource: 'react',
        format: 'iife',
        platform: 'browser',
        loader: {
          '.js': 'jsx',
          '.jsx': 'jsx',
          '.json': 'json',
          '.css': 'text',
        },
        metafile: true,
        external: ['react', 'react-dom'],
      });

      return result.outputFiles[0].text;
    }; 
import * as esbuild from 'esbuild-wasm';
import unpkgPathPlugin from './plugins/unpkg-path-plugin';
import fetchPlugin from './plugins/fetch-plugin';

export const bundleCode = async (files) => {
  try {
    const result = await esbuild.build({
      entryPoints: ['index.jsx'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(files)],
      define: {
        'process.env.NODE_ENV': '"development"',
        global: 'window',
      },
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    });

    return result.outputFiles[0].text;
  } catch (err) {
    throw new Error(`Bundle failed: ${err.message}`);
  }
};
