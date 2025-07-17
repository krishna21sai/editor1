import React, { createContext, useContext, useState } from 'react';

const defaultFiles = {
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Hello World</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
  'index.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
  'App.jsx': `import React, { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h1>Hello, World!</h1>
      <button onClick={() => setCount(count + 1)}>
        count {count}
      </button>
    </div>
  )
}

export default App
`,
  'package.json': `{
  "name": "my-playground",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
`
};

const FileSystemContext = createContext();

export function FileSystemProvider({ children }) {
  const [files, setFiles] = useState(defaultFiles);
  const [selectedFile, setSelectedFile] = useState('index.jsx');

  const addFile = (filename, content = '') => {
    setFiles(f => ({ ...f, [filename]: content }));
    setSelectedFile(filename);
  };
  const renameFile = (oldName, newName) => {
    setFiles(f => {
      const { [oldName]: oldContent, ...rest } = f;
      return { ...rest, [newName]: oldContent };
    });
    setSelectedFile(newName);
  };
  const deleteFile = (filename) => {
    setFiles(f => {
      const { [filename]: _, ...rest } = f;
      return rest;
    });
    setSelectedFile(Object.keys(files).filter(f => f !== filename)[0] || '');
  };
  const updateFile = (filename, content) => {
    setFiles(f => ({ ...f, [filename]: content }));
  };

  return (
    <FileSystemContext.Provider value={{ files, selectedFile, setSelectedFile, addFile, renameFile, deleteFile, updateFile }}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  return useContext(FileSystemContext);
} 