
import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';

const FileIcon = ({ filename }) => {
  if (filename.endsWith('.jsx') || filename.endsWith('.js')) return '📄';
  if (filename.endsWith('.css')) return '🎨';
  if (filename.endsWith('.json')) return '📋';
  if (filename.endsWith('.html')) return '🌐';
  if (filename.endsWith('.md')) return '📝';
  return '📄';
};

const FolderIcon = ({ isOpen }) => (
  <span style={{ marginRight: '4px', fontSize: '12px', color: '#cccccc' }}>
    {isOpen ? '📂' : '📁'}
  </span>
);

export default function FileTree() {
  const { files, activeTab, openTab, createFile, deleteFile } = useFileSystem();
  const [newFileName, setNewFileName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({
    'src': true,
    'public': true,
    'components': true,
    'utils': true
  });
  const [folders, setFolders] = useState({
    'src': [],
    'public': [],
    'components': [],
    'utils': []
  });

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const filename = newFileName.trim();
      if (!filename.includes('.')) {
        createFile(filename + '.jsx', '');
      } else {
        createFile(filename, '');
      }
      setNewFileName('');
      setShowInput(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folderName = newFolderName.trim();
      setFolders(prev => ({ ...prev, [folderName]: [] }));
      setExpandedFolders(prev => ({ ...prev, [folderName]: true }));
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const handleKeyPress = (e, isFolder = false) => {
    if (e.key === 'Enter') {
      if (isFolder) {
        handleCreateFolder();
      } else {
        handleCreateFile();
      }
    } else if (e.key === 'Escape') {
      if (isFolder) {
        setShowFolderInput(false);
        setNewFolderName('');
      } else {
        setShowInput(false);
        setNewFileName('');
      }
    }
  };

  // Group files by type/category for better organization
  const organizeFiles = () => {
    const organized = {
      root: [],
      src: [],
      public: [],
      components: [],
      utils: []
    };

    Object.keys(files).forEach(filename => {
      if (filename.includes('App.jsx') || filename.includes('index.jsx')) {
        organized.src.push(filename);
      } else if (filename.endsWith('.html')) {
        organized.public.push(filename);
      } else if (filename.includes('Component') || filename.includes('component')) {
        organized.components.push(filename);
      } else if (filename.includes('util') || filename.includes('helper')) {
        organized.utils.push(filename);
      } else {
        organized.root.push(filename);
      }
    });

    return organized;
  };

  const organizedFiles = organizeFiles();

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <span>EXPLORER</span>
        <div className="header-actions">
          <button
            onClick={() => setShowInput(true)}
            className="action-button"
            title="New File"
          >
            📄
          </button>
          <button
            onClick={() => setShowFolderInput(true)}
            className="action-button"
            title="New Folder"
          >
            📁
          </button>
        </div>
      </div>
      
      {showInput && (
        <div className="input-container">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, false)}
            onBlur={() => setShowInput(false)}
            placeholder="filename.jsx"
            autoFocus
            className="file-input"
          />
        </div>
      )}

      {showFolderInput && (
        <div className="input-container">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, true)}
            onBlur={() => setShowFolderInput(false)}
            placeholder="folder name"
            autoFocus
            className="file-input"
          />
        </div>
      )}

      <div className="files-container">
        {/* Root Files */}
        {organizedFiles.root.map(filename => (
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
            <FileIcon filename={filename} />
            <span className="file-name">{filename}</span>
          </div>
        ))}

        {/* Folders */}
        {Object.entries(folders).map(([folderName, folderFiles]) => (
          <div key={folderName} className="folder-container">
            <div 
              className="folder-header"
              onClick={() => toggleFolder(folderName)}
            >
              <FolderIcon isOpen={expandedFolders[folderName]} />
              <span className="folder-name">{folderName}</span>
            </div>
            {expandedFolders[folderName] && (
              <div className="folder-contents">
                {organizedFiles[folderName]?.map(filename => (
                  <div
                    key={filename}
                    className={`file-item nested ${activeTab === filename ? 'active' : ''}`}
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
                    <FileIcon filename={filename} />
                    <span className="file-name">{filename}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
