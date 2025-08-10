
import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';

export default function FileTree() {
  const { files, activeTab, openTab, createFile, deleteFile } = useFileSystem();
  const [newFileName, setNewFileName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const filename = newFileName.trim();
      if (!filename.includes('.')) {
        // Add .jsx extension if no extension provided
        createFile(filename + '.jsx', '');
      } else {
        createFile(filename, '');
      }
      setNewFileName('');
      setShowInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewFileName('');
    }
  };

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        Files
        <button
          onClick={() => setShowInput(true)}
          style={{
            float: 'right',
            background: 'none',
            border: 'none',
            color: '#cccccc',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          +
        </button>
      </div>
      
      {showInput && (
        <div style={{ padding: '5px 15px' }}>
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={() => setShowInput(false)}
            placeholder="filename.jsx"
            autoFocus
            style={{
              width: '100%',
              background: '#3c3c3c',
              border: '1px solid #007acc',
              color: '#cccccc',
              padding: '2px 5px',
              fontSize: '12px'
            }}
          />
        </div>
      )}

      {Object.keys(files).map(filename => (
        <div
          key={filename}
          className={`file-item ${activeTab === filename ? 'active' : ''}`}
          onClick={() => openTab(filename)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (filename !== 'App.jsx' && filename !== 'index.jsx') {
              if (window.confirm(`Delete ${filename}?`)) {
                deleteFile(filename);
              }
            }
          }}
        >
          {filename}
        </div>
      ))}
    </div>
  );
}
