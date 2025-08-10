
import React, { createContext, useContext, useState } from 'react';

const defaultFiles = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>React Test</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  'index.jsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);`,
  'App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hello React Playground!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)} style={{ marginLeft: '10px' }}>
        Decrement
      </button>
    </div>
  );
}`,
  'style.css': `body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

#root {
  min-height: 100vh;
}`,
  'package.json': `{
  "name": "react-playground",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`
};

const FileSystemContext = createContext();

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export const FileSystemProvider = ({ children }) => {
  const [files, setFiles] = useState(defaultFiles);
  const [activeTab, setActiveTab] = useState('App.jsx');

  const createFile = (filename, content = '') => {
    setFiles(prev => ({ ...prev, [filename]: content }));
    setActiveTab(filename);
  };

  const deleteFile = (filename) => {
    if (filename === 'App.jsx' || filename === 'index.jsx') return;
    
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[filename];
      return newFiles;
    });
    
    if (activeTab === filename) {
      const remainingFiles = Object.keys(files).filter(f => f !== filename);
      setActiveTab(remainingFiles[0] || 'App.jsx');
    }
  };

  const updateFile = (filename, content) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
  };

  const openTab = (filename) => {
    setActiveTab(filename);
  };

  const closeTab = (filename) => {
    if (filename === 'App.jsx' || filename === 'index.jsx') return;
    deleteFile(filename);
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        activeTab,
        createFile,
        deleteFile,
        updateFile,
        openTab,
        closeTab
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};
