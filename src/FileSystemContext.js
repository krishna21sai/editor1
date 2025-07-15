import React, { createContext, useContext, useState } from 'react';

const defaultFiles = {
  'index.jsx': `import App from './App';\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`,
  'App.jsx': `export default function App() {\n  return <h2>Hello from App.jsx!</h2>;\n}`,
  'package.json': `{
  "name": "my-playground",
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}`
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