export default function fetchPlugin(files) {
  return {
    name: 'fetch-plugin',
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        // ✅ Serve from in-memory files
        if (files[args.path]) {
          const ext = args.path.endsWith('.json') ? 'json' : 'jsx';
          return {
            loader: ext,
            contents: files[args.path],
            resolveDir: '/', // Required
          };
        }

        // ✅ Otherwise, fetch from CDN
        try {
          const response = await fetch(args.path);
          const text = await response.text();
          const ext = args.path.endsWith('.json') ? 'json' : 'jsx';

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
  