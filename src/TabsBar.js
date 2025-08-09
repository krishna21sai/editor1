import React, { useEffect, useState } from 'react';
import { useFileSystem } from './FileSystemContext';

const TabsBar = () => {
  const { openTabs, activeTab, switchTab, closeTab } = useFileSystem();
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, targetTab: null });

  const getFileIcon = (filename) => {
    if (filename.endsWith('.jsx') || filename.endsWith('.js')) return '⚛️';
    if (filename.endsWith('.html')) return '🌐';
    if (filename.endsWith('.css')) return '🎨';
    if (filename.endsWith('.json')) return '📄';
    return '📝';
  };

  const handleTabClick = (e, filename) => {
    e.preventDefault();
    switchTab(filename);
  };

  const handleCloseTab = (e, filename) => {
    e.preventDefault();
    e.stopPropagation();
    closeTab(filename);
  };

  const handleContextMenu = (e, filename) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      targetTab: filename
    });
  };

  const handleContextMenuAction = (action) => {
    const { targetTab } = contextMenu;
    
    switch (action) {
      case 'close':
        closeTab(targetTab);
        break;
      case 'closeOthers':
        openTabs.forEach(tab => {
          if (tab !== targetTab) {
            closeTab(tab);
          }
        });
        break;
      case 'closeAll':
        openTabs.forEach(tab => closeTab(tab));
        break;
      default:
        break;
    }
    
    setContextMenu({ show: false, x: 0, y: 0, targetTab: null });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (activeTab) {
          closeTab(activeTab);
        }
      }
    };

    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, targetTab: null });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeTab, closeTab]);

  if (openTabs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="tabs-bar">
        {openTabs.map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, tab)}
            onContextMenu={(e) => handleContextMenu(e, tab)}
          >
            <span className="tab-icon">{getFileIcon(tab)}</span>
            <span className="tab-title">{tab}</span>
            <button
              className="tab-close"
              onClick={(e) => handleCloseTab(e, tab)}
              title="Close tab (Ctrl+W)"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000
          }}
        >
          <div className="context-menu-item" onClick={() => handleContextMenuAction('close')}>
            Close Tab
          </div>
          <div className="context-menu-item" onClick={() => handleContextMenuAction('closeOthers')}>
            Close Others
          </div>
          <div className="context-menu-item" onClick={() => handleContextMenuAction('closeAll')}>
            Close All
          </div>
        </div>
      )}
    </>
  );
};

export default TabsBar; 