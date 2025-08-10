import React from 'react';
import { useFileSystem } from './FileSystemContext';

export default function TabsBar() {
  const { files, activeTab, openTab, closeTab } = useFileSystem();

  return (
    <div className="tabs-bar">
      {Object.keys(files).map(filename => (
        <div
          key={filename}
          className={`tab ${activeTab === filename ? 'active' : ''}`}
          onClick={() => openTab(filename)}
        >
          <span className="tab-name">{filename}</span>
          {filename !== 'App.jsx' && filename !== 'index.jsx' && (
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(filename);
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}