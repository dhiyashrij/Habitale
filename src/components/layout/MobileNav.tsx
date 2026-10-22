import React from 'react';
import { Compass, Sparkles, CheckSquare, Palette, BarChart3, Settings, Moon } from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: 'Today', icon: Compass },
    { id: 'routines', label: 'Routines', icon: Sparkles },
    { id: 'todos', label: 'To-Dos', icon: CheckSquare },
    { id: 'cosmic-focus', label: 'Focus', icon: Moon },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'analytics', label: 'Progress', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--card-border)',
        boxShadow: '0 -4px 16px rgba(53, 50, 56, 0.05)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 12px 14px 12px',
        zIndex: 100,
      }}
    >
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.68rem',
              fontWeight: isActive ? 600 : 400,
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              }}
            >
              <Icon size={17} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
