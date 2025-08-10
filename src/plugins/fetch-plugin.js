
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
