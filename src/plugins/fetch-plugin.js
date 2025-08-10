
```javascript
export default function fetchPlugin(files) {
  return {
    name: 'fetch-plugin',
    setup(build) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        const path = args.path;
        
        if (path === 'index.css') {
          return {
            loader: 'css',
            contents: files['style.css'] || ''
          };
        }

        if (files[path]) {
          return {
            loader: 'jsx',
            contents: files[path]
          };
        }

        const url = `https://unpkg.com${path}`;
        
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
          }
          const contents = await response.text();
          
          return {
            loader: 'jsx',
            contents
          };
        } catch (error) {
          console.error('Fetch error:', error);
          return {
            loader: 'jsx',
            contents: `export default function() { return null; }`
          };
        }
      });
    }
  };
}
```
