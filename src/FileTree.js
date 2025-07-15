import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';

export default function FileTree() {
  const { files, selectedFile, setSelectedFile, addFile, renameFile, deleteFile } = useFileSystem();
  const [newFileName, setNewFileName] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  return (
    <div style={{ width: 180, background: '#f4f4f4', padding: 8, borderRight: '1px solid #ddd', height: '100%' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Files</div>
      {Object.keys(files).map(filename => (
        <div key={filename} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
          {renaming === filename ? (
            <input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={() => { renameFile(filename, renameValue); setRenaming(null); }}
              onKeyDown={e => { if (e.key === 'Enter') { renameFile(filename, renameValue); setRenaming(null); }}}
              autoFocus
              style={{ flex: 1 }}
            />
          ) : (
            <span
              style={{
                cursor: 'pointer',
                background: selectedFile === filename ? '#e0e0e0' : 'transparent',
                flex: 1,
                padding: '2px 4px',
                borderRadius: 3
              }}
              onClick={() => setSelectedFile(filename)}
              onDoubleClick={() => { setRenaming(filename); setRenameValue(filename); }}
            >
              {filename}
            </span>
          )}
          <button onClick={() => deleteFile(filename)} style={{ marginLeft: 4 }}>🗑️</button>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <input
          value={newFileName}
          onChange={e => setNewFileName(e.target.value)}
          placeholder="New file name"
          style={{ width: '70%' }}
        />
        <button onClick={() => { if (newFileName) { addFile(newFileName); setNewFileName(''); } }}>Add</button>
      </div>
    </div>
  );
} 