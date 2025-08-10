
import React, { useState, useRef, useEffect } from 'react';
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

const ContextMenu = ({ x, y, filename, onClose, onRename, onDelete }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const isProtected = filename === 'App.jsx' || filename === 'index.jsx' || filename === 'index.html';

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 1000,
      }}
    >
      {!isProtected && (
        <>
          <div className="context-menu-item" onClick={() => onRename(filename)}>
            <span className="context-menu-icon">✏️</span>
            Rename
          </div>
          <div className="context-menu-item" onClick={() => onDelete(filename)}>
            <span className="context-menu-icon">🗑️</span>
            Delete
          </div>
        </>
      )}
      {isProtected && (
        <div className="context-menu-item disabled">
          <span className="context-menu-icon">🔒</span>
          Protected file
        </div>
      )}
    </div>
  );
};

export default function FileTree() {
  const { files, activeTab, openTab, createFile, deleteFile, updateFile } = useFileSystem();
  const [newFileName, setNewFileName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({
    'src': true,
    'public': true,
    'components': true,
    'utils': true
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
      setExpandedFolders(prev => ({ ...prev, [folderName]: true }));
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  const handleRename = (oldFilename) => {
    setRenamingFile(oldFilename);
    setRenameValue(oldFilename);
    setContextMenu(null);
  };

  const handleRenameComplete = () => {
    if (renameValue.trim() && renameValue !== renamingFile) {
      const content = files[renamingFile];
      createFile(renameValue.trim(), content);
      deleteFile(renamingFile);
    }
    setRenamingFile(null);
    setRenameValue('');
  };

  const handleDelete = (filename) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      deleteFile(filename);
    }
    setContextMenu(null);
  };

  const handleContextMenu = (e, filename) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      filename
    });
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const handleKeyPress = (e, isFolder = false, isRename = false) => {
    if (e.key === 'Enter') {
      if (isRename) {
        handleRenameComplete();
      } else if (isFolder) {
        handleCreateFolder();
      } else {
        handleCreateFile();
      }
    } else if (e.key === 'Escape') {
      if (isRename) {
        setRenamingFile(null);
        setRenameValue('');
      } else if (isFolder) {
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
          <div key={filename}>
            {renamingFile === filename ? (
              <div className="input-container">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, false, true)}
                  onBlur={handleRenameComplete}
                  autoFocus
                  className="file-input"
                />
              </div>
            ) : (
              <div
                className={`file-item ${activeTab === filename ? 'active' : ''}`}
                onClick={() => openTab(filename)}
                onContextMenu={(e) => handleContextMenu(e, filename)}
              >
                <FileIcon filename={filename} />
                <span className="file-name">{filename}</span>
              </div>
            )}
          </div>
        ))}

        {/* Folders */}
        {Object.entries(expandedFolders).map(([folderName, isExpanded]) => (
          <div key={folderName} className="folder-container">
            <div 
              className="folder-header"
              onClick={() => toggleFolder(folderName)}
            >
              <FolderIcon isOpen={isExpanded} />
              <span className="folder-name">{folderName}</span>
            </div>
            {isExpanded && (
              <div className="folder-contents">
                {organizedFiles[folderName]?.map(filename => (
                  <div key={filename}>
                    {renamingFile === filename ? (
                      <div className="input-container nested">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, false, true)}
                          onBlur={handleRenameComplete}
                          autoFocus
                          className="file-input"
                        />
                      </div>
                    ) : (
                      <div
                        className={`file-item nested ${activeTab === filename ? 'active' : ''}`}
                        onClick={() => openTab(filename)}
                        onContextMenu={(e) => handleContextMenu(e, filename)}
                      >
                        <FileIcon filename={filename} />
                        <span className="file-name">{filename}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          filename={contextMenu.filename}
          onClose={() => setContextMenu(null)}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
