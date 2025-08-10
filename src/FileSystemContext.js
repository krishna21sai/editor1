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

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Hello React!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default App;`,
  'style.css': `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background: #f5f5f5;
  transition: background 0.3s;
}

.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #0056b3;
}`,
  'package.json': `{
  "name": "react-editor",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`
};

const FileSystemContext = createContext();

export function FileSystemProvider({ children }) {
  const [files, setFiles] = useState(defaultFiles);
  const [activeTab, setActiveTab] = useState('App.jsx');
  const [openTabs, setOpenTabs] = useState(['App.jsx']);

  const updateFile = (filename, content) => {
    setFiles(prev => ({
      ...prev,
      [filename]: content
    }));
  };

  const createFile = (filename, content = '') => {
    if (!files[filename]) {
      setFiles(prev => ({
        ...prev,
        [filename]: content
      }));
      if (!openTabs.includes(filename)) {
        setOpenTabs(prev => [...prev, filename]);
      }
      setActiveTab(filename);
    }
  };

  const deleteFile = (filename) => {
    if (files[filename] && filename !== 'App.jsx') {
      const newFiles = { ...files };
      delete newFiles[filename];
      setFiles(newFiles);

      const newTabs = openTabs.filter(tab => tab !== filename);
      setOpenTabs(newTabs);

      if (activeTab === filename) {
        setActiveTab(newTabs[0] || 'App.jsx');
      }
    }
  };

  const openTab = (filename) => {
    if (!openTabs.includes(filename)) {
      setOpenTabs(prev => [...prev, filename]);
    }
    setActiveTab(filename);
  };

  const closeTab = (filename) => {
    if (filename === 'App.jsx') return; // Don't close main file

    const newTabs = openTabs.filter(tab => tab !== filename);
    setOpenTabs(newTabs);

    if (activeTab === filename) {
      setActiveTab(newTabs[newTabs.length - 1] || 'App.jsx');
    }
  };

  return (
    <FileSystemContext.Provider value={{
      files,
      activeTab,
      openTabs,
      updateFile,
      createFile,
      deleteFile,
      openTab,
      closeTab,
      setActiveTab
    }}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}