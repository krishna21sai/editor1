export default function unpkgPathPlugin() {
    return {
      name: 'unpkg-path-plugin',
      setup(build) {
        build.onResolve({ filter: /.*/ }, async (args) => {
          // Entry or local file from virtual file system
          if (
            args.path.startsWith('./') ||
            args.path.startsWith('../') ||
            args.path.endsWith('.jsx') ||
            args.path.endsWith('.js') ||
            args.path.endsWith('.json')
          ) {
            let resolvedPath = args.path.replace(/^\.\//, '');
  
            // 👇 Append .jsx if no extension
            if (!/\.(js|jsx|json)$/.test(resolvedPath)) {
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
  