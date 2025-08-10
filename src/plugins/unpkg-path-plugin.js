
export default function unpkgPathPlugin() {
  return {
    name: 'unpkg-path-plugin',
    setup(build) {
      build.onResolve({ filter: /.*/ }, async (args) => {
        // Special-case react and react-dom to always use UMD builds
        if (args.path === 'react') {
          return {
            namespace: 'a',
            path: 'https://unpkg.com/react@18/umd/react.development.js',
          };
        }
        if (args.path === 'react-dom') {
          return {
            namespace: 'a',
            path: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
          };
        }
        if (args.path === 'react-dom/client') {
          return {
            namespace: 'a',
            path: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
          };
        }
        if (args.path === 'react-router-dom') {
          return {
            namespace: 'a',
            path: 'https://unpkg.com/react-router-dom@5.3.4/umd/react-router-dom.js',
          };
        }
        
        // Entry or local file from virtual file system
        if (
          args.path.startsWith('./') ||
          args.path.startsWith('../') ||
          args.path.endsWith('.jsx') ||
          args.path.endsWith('.js') ||
          args.path.endsWith('.json') ||
          args.path.endsWith('.html') ||
          args.path.endsWith('.css')
        ) {
          let resolvedPath = args.path.replace(/^\.\//, '');

          // Append .jsx if no extension and it's not a CSS file
          if (!resolvedPath.includes('.') && !resolvedPath.endsWith('.css')) {
            resolvedPath += '.jsx';
          }

          return {
            namespace: 'file-system',
            path: resolvedPath,
          };
        }

        // External packages from unpkg
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
}
