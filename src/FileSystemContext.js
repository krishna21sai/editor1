
```javascript
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
  const [openTabs, setOpenTabs] = useState(['App.jsx', 'index.jsx', 'index.html']);
  const [folders, setFolders] = useState(['src', 'public', 'components', 'utils']);

  const createFile = (filename, content = '', folder = null) => {
    const fullPath = folder ? `${folder}/${filename}` : filename;
    setFiles(prev => ({ ...prev, [fullPath]: content }));
    setActiveTab(fullPath);
    if (!openTabs.includes(fullPath)) {
      setOpenTabs(prev => [...prev, fullPath]);
    }
  };

  const createFolder = (folderName) => {
    if (!folders.includes(folderName)) {
      setFolders(prev => [...prev, folderName]);
    }
  };

  const deleteFile = (filename) => {
    if (filename === 'App.jsx' || filename === 'index.jsx' || filename === 'index.html') return;

    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[filename];
      return newFiles;
    });

    setOpenTabs(prev => prev.filter(tab => tab !== filename));

    if (activeTab === filename) {
      const remainingTabs = openTabs.filter(tab => tab !== filename);
      setActiveTab(remainingTabs[0] || 'App.jsx');
    }
  };

  const deleteFolder = (folderName) => {
    if (['src', 'public'].includes(folderName)) return; // Protect core folders

    // Delete all files in the folder
    const filesToDelete = Object.keys(files).filter(filename => 
      filename.startsWith(`${folderName}/`)
    );
    
    setFiles(prev => {
      const newFiles = { ...prev };
      filesToDelete.forEach(filename => {
        delete newFiles[filename];
      });
      return newFiles;
    });

    // Remove folder
    setFolders(prev => prev.filter(folder => folder !== folderName));

    // Close tabs for deleted files
    setOpenTabs(prev => prev.filter(tab => !filesToDelete.includes(tab)));

    // Switch active tab if needed
    if (filesToDelete.includes(activeTab)) {
      const remainingTabs = openTabs.filter(tab => !filesToDelete.includes(tab));
      setActiveTab(remainingTabs[0] || 'App.jsx');
    }
  };

  const updateFile = (filename, content) => {
    setFiles(prev => ({ ...prev, [filename]: content }));
  };

  const openTab = (filename) => {
    setActiveTab(filename);
    if (!openTabs.includes(filename)) {
      setOpenTabs(prev => [...prev, filename]);
    }
  };

  const closeTab = (filename) => {
    if (filename === 'App.jsx' || filename === 'index.jsx' || filename === 'index.html') return;
    setOpenTabs(prev => prev.filter(tab => tab !== filename));
    
    if (activeTab === filename) {
      const remainingTabs = openTabs.filter(tab => tab !== filename);
      setActiveTab(remainingTabs[0] || 'App.jsx');
    }
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        activeTab,
        setActiveTab,
        openTabs,
        setOpenTabs,
        folders,
        createFile,
        createFolder,
        deleteFile,
        deleteFolder,
        updateFile,
        openTab,
        closeTab
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};
```
