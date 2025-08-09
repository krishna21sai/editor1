import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';

export default function FileTree() {
  const { files, activeTab, openTab, addFile, renameFile, deleteFile } = useFileSystem();
  const [newFileName, setNewFileName] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  return (
    <div className="file-tree">
      <div className="file-tree-header">Files</div>
      <div className="file-list">
        {Object.keys(files).map(filename => (
          <div key={filename} className="file-item">
            {renaming === filename ? (
              <input
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => { renameFile(filename, renameValue); setRenaming(null); }}
                onKeyDown={e => { if (e.key === 'Enter') { renameFile(filename, renameValue); setRenaming(null); }}}
                autoFocus
                className="rename-input"
              />
            ) : (
              <span
                className={`file-name ${activeTab === filename ? 'active' : ''}`}
                onClick={() => openTab(filename)}
                onDoubleClick={() => { setRenaming(filename); setRenameValue(filename); }}
              >
                {filename}
              </span>
            )}
            <button 
              onClick={() => deleteFile(filename)} 
              className="delete-btn"
              title="Delete file"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      <div className="add-file-section">
        <input
          value={newFileName}
          onChange={e => setNewFileName(e.target.value)}
          placeholder="New file name"
          className="new-file-input"
          onKeyDown={e => { if (e.key === 'Enter' && newFileName) { addFile(newFileName); setNewFileName(''); }}}
        />
        <button 
          onClick={() => { if (newFileName) { addFile(newFileName); setNewFileName(''); } }}
          className="add-file-btn"
        >
          Add
        </button>
      </div>
    </div>
  );
} 