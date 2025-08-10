
import React from 'react';
import { useFileSystem } from './FileSystemContext';

export default function TabsBar() {
  const { openTabs, activeTab, setActiveTab, closeTab } = useFileSystem();

  return (
    <div className="tabs-bar">
      {openTabs.map(filename => (
        <div
          key={filename}
          className={`tab ${activeTab === filename ? 'active' : ''}`}
          onClick={() => setActiveTab(filename)}
        >
          <span className="tab-name">{filename}</span>
          {filename !== 'App.jsx' && (
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
