import React from 'react';
import {
  Sparkles,
  CheckSquare,
  Palette,
  BarChart3,
  Settings,
  Flame,
  LogOut,
  Compass,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoutines } from '../../context/RoutinesContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, signOut } = useAuth();
  const { streakSummary } = useRoutines();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'routines', label: 'My Routines', icon: Sparkles },
    { id: 'todos', label: 'To-Do Lists', icon: CheckSquare },
    { id: 'cosmic-focus', label: 'Cosmic Focus', icon: Moon },
    { id: 'theme', label: 'Theme Studio', icon: Palette },
    { id: 'analytics', label: 'Progress & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        padding: '28px 20px',
        flexShrink: 0,
        zIndex: 50,
      }}
      className="sidebar-desktop"
    >
      {/* Brand Header */}
      <div style={{ marginBottom: '28px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(217, 155, 170, 0.4)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: 'var(--text-main)',
              }}
            >
              Habitale
            </h1>
            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--primary)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Your habits, your story.
            </p>
          </div>
        </div>
      </div>

      {/* User Persona & Streak Capsule */}
      {user && (
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--card-border)',
            padding: '12px 14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--primary)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'H'}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user.displayName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {user.persona || 'Mindful Muse'}
              </div>
            </div>
          </div>

          <div
            title={`${streakSummary.highestStreak} day best streak`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.76rem',
              fontWeight: 700,
            }}
          >
            <Flame size={13} fill="currentColor" />
            <span>{streakSummary.highestStreak}d</span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(217, 155, 170, 0.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Inspirational Quote Card */}
      <div
        style={{
          marginTop: 'auto',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          border: '1px dashed var(--card-border)',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontStyle: 'italic',
            color: 'var(--text-main)',
            lineHeight: 1.4,
            marginBottom: '4px',
          }}
        >
          "Take gentle care of your minutes, and the days will bloom gracefully."
        </p>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>— Habitale Journal</span>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={signOut}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          borderRadius: 'var(--radius-sm)',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <LogOut size={15} />
        <span>Sign Out</span>
      </button>
    </aside>
  );
};
