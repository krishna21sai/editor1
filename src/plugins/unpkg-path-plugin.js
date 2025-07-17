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
          // Entry or local file from virtual file system
          if (
            args.path.startsWith('./') ||
            args.path.startsWith('../') ||
            args.path.endsWith('.jsx') ||
            args.path.endsWith('.js') ||
            args.path.endsWith('.json') ||
            args.path.endsWith('.html')
          ) {
            let resolvedPath = args.path.replace(/^\.\//, '');
  
            // 👇 Append .jsx if no extension
            if (!/\.(js|jsx|json|html)$/.test(resolvedPath)) {
              resolvedPath += '.jsx';
            }
  
            return {
              namespace: 'a',
              path: resolvedPath,
            };
          }
  
          // NPM packages
          return {
            namespace: 'a',
            path: `https://unpkg.com/${args.path}`,
          };
        });
      },
    };
  }
  