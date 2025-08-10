
```javascript
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

const ContextMenu = ({ x, y, filename, isFolder, onClose, onRename, onDelete, onAddFile }) => {
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

  const isProtected = filename === 'App.jsx' || filename === 'index.jsx' || filename === 'index.html' || 
                     (isFolder && ['src', 'public'].includes(filename));

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
      {isFolder && (
        <div className="context-menu-item" onClick={() => onAddFile(filename)}>
          <span className="context-menu-icon">📄</span>
          New File
        </div>
      )}
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
          Protected {isFolder ? 'folder' : 'file'}
        </div>
      )}
    </div>
  );
};

export default function FileTree() {
  const { 
    files, 
    activeTab, 
    openTab, 
    createFile, 
    createFolder, 
    deleteFile, 
    deleteFolder,
    folders 
  } = useFileSystem();
  
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
  const [activeFolder, setActiveFolder] = useState(null);

  const handleCreateFile = (folder = null) => {
    if (newFileName.trim()) {
      const filename = newFileName.trim();
      const finalFilename = !filename.includes('.') ? filename + '.jsx' : filename;
      createFile(finalFilename, '', folder);
      setNewFileName('');
      setShowInput(false);
      setActiveFolder(null);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const folderName = newFolderName.trim();
      createFolder(folderName);
      setExpandedFolders(prev => ({ ...prev, [folderName]: true }));
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  const handleRename = (oldName) => {
    setRenamingFile(oldName);
    setRenameValue(oldName);
    setContextMenu(null);
  };

  const handleRenameComplete = () => {
    if (renameValue.trim() && renameValue !== renamingFile) {
      const isFolder = folders.includes(renamingFile);
      
      if (isFolder) {
        // Rename folder and all its files
        const oldFiles = Object.keys(files).filter(filename => 
          filename.startsWith(`${renamingFile}/`)
        );
        
        // Create new folder
        createFolder(renameValue.trim());
        
        // Move files to new folder
        oldFiles.forEach(filename => {
          const newFilename = filename.replace(`${renamingFile}/`, `${renameValue.trim()}/`);
          createFile(newFilename.split('/')[1], files[filename], renameValue.trim());
        });
        
        // Delete old folder
        deleteFolder(renamingFile);
      } else {
        // Rename file
        const content = files[renamingFile];
        const folder = renamingFile.includes('/') ? renamingFile.split('/')[0] : null;
        const newFilename = folder ? renameValue.trim().split('/')[1] || renameValue.trim() : renameValue.trim();
        createFile(newFilename, content, folder);
        deleteFile(renamingFile);
      }
    }
    setRenamingFile(null);
    setRenameValue('');
  };

  const handleDelete = (name) => {
    const isFolder = folders.includes(name);
    const message = isFolder 
      ? `Are you sure you want to delete the folder "${name}" and all its contents?`
      : `Are you sure you want to delete "${name}"?`;
      
    if (window.confirm(message)) {
      if (isFolder) {
        deleteFolder(name);
      } else {
        deleteFile(name);
      }
    }
    setContextMenu(null);
  };

  const handleContextMenu = (e, name, isFolder = false) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      filename: name,
      isFolder
    });
  };

  const handleAddFile = (folderName) => {
    setActiveFolder(folderName);
    setShowInput(true);
    setContextMenu(null);
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
        handleCreateFile(activeFolder);
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
        setActiveFolder(null);
      }
    }
  };

  // Organize files by folder
  const organizeFiles = () => {
    const organized = { root: [] };
    
    folders.forEach(folder => {
      organized[folder] = [];
    });

    Object.keys(files).forEach(filename => {
      if (filename.includes('/')) {
        const folder = filename.split('/')[0];
        if (organized[folder]) {
          organized[folder].push(filename);
        }
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
            onBlur={() => {
              setShowInput(false);
              setActiveFolder(null);
            }}
            placeholder={activeFolder ? `${activeFolder}/filename.jsx` : "filename.jsx"}
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
                onContextMenu={(e) => handleContextMenu(e, filename, false)}
              >
                <FileIcon filename={filename} />
                <span className="file-name">{filename}</span>
              </div>
            )}
          </div>
        ))}

        {/* Folders */}
        {folders.map(folderName => (
          <div key={folderName} className="folder-container">
            {renamingFile === folderName ? (
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
                className="folder-header"
                onClick={() => toggleFolder(folderName)}
                onContextMenu={(e) => handleContextMenu(e, folderName, true)}
              >
                <FolderIcon isOpen={expandedFolders[folderName]} />
                <span className="folder-name">{folderName}</span>
              </div>
            )}
            
            {expandedFolders[folderName] && (
              <div className="folder-contents">
                {organizedFiles[folderName]?.map(filepath => {
                  const filename = filepath.split('/')[1];
                  return (
                    <div key={filepath}>
                      {renamingFile === filepath ? (
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
                          className={`file-item nested ${activeTab === filepath ? 'active' : ''}`}
                          onClick={() => openTab(filepath)}
                          onContextMenu={(e) => handleContextMenu(e, filepath, false)}
                        >
                          <FileIcon filename={filename} />
                          <span className="file-name">{filename}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
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
          isFolder={contextMenu.isFolder}
          onClose={() => setContextMenu(null)}
          onRename={handleRename}
          onDelete={handleDelete}
          onAddFile={handleAddFile}
        />
      )}
    </div>
  );
}
```
