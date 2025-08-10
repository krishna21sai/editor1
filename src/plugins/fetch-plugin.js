
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
            resolveDir: '/',
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
