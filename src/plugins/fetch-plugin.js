export default function fetchPlugin(files) {
  return {
    name: 'fetch-plugin',
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        if (files[args.path]) {
          let ext = 'jsx';
          if (args.path.endsWith('.json')) ext = 'json';
          else if (args.path.endsWith('.css')) ext = 'text';
          return {
            loader: ext,
            contents: files[args.path],
            resolveDir: '/', // Required
          };
        }

        try {
          const response = await fetch(args.path);
          const text = await response.text();
          let ext = 'jsx';
          if (args.path.endsWith('.json')) ext = 'json';
          else if (args.path.endsWith('.css')) ext = 'text';

          return {
            loader: ext,
            contents: text,
            resolveDir: new URL('./', response.url).pathname,
          };
        } catch (err) {
          return {
            loader: 'jsx',
            contents: `throw new Error("Failed to fetch: ${args.path}")`,
          };
        }
      });
    },
  };
}
  
export default function fetchPlugin(files) {
  return {
    name: 'fetch-plugin',
    setup(build) {
      // Handle virtual file system files
      build.onLoad({ filter: /.*/, namespace: 'file-system' }, (args) => {
        const filename = args.path;
        if (files[filename]) {
          return {
            loader: filename.endsWith('.css') ? 'css' : 
                   filename.endsWith('.json') ? 'json' : 'jsx',
            contents: files[filename],
          };
        }
        throw new Error(`File not found: ${filename}`);
      });

      // Handle external packages from unpkg
      build.onLoad({ filter: /.*/, namespace: 'a' }, async (args) => {
        try {
          const response = await fetch(args.path);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${args.path}`);
          }
          const contents = await response.text();
          return {
            loader: 'js',
            contents,
          };
        } catch (err) {
          throw new Error(`Failed to load ${args.path}: ${err.message}`);
        }
      });
    },
  };
}
