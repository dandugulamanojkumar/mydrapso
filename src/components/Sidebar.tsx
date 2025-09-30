import React from 'react';

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Sidebar({ sidebarCollapsed, setSidebarCollapsed, activePage, setActivePage }: SidebarProps) {
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'shorts', icon: '🎬', label: 'Clickz' },
    { id: 'videos', icon: '📹', label: 'Your Videos' },
    { id: 'liked', icon: '👍', label: 'Liked' },
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  return (
    <aside className={`sidebar fixed ${sidebarCollapsed ? "collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarCollapsed((s) => !s)}
      >
        ☰
      </button>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={activePage === item.id ? 'active' : ''}
            >
              <a className={activePage === item.id ? 'active' : ''}>
                {item.icon} {!sidebarCollapsed && item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}