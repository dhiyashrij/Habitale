import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRoutines } from '../context/RoutinesContext';
import { useTodos } from '../context/TodosContext';
import { useReflection } from '../context/ReflectionContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { deleteUserAccountData } from '../services/firestore';
import {
  User,
  Download,
  Upload,
  RotateCcw,
  Check,
  LogOut,
  Compass,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, signOut, restartOnboarding } = useAuth();
  const { theme } = useTheme();
  const { routines, loadStarterRoutines } = useRoutines();
  const { todos, loadStarterTodos } = useTodos();
  const { reflections } = useReflection();

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [persona, setPersona] = useState(user?.persona || 'Mindful Muse');
  const [dailyIntention, setDailyIntention] = useState(user?.dailyIntention || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Account deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      await deleteUserAccountData(user.id);
      localStorage.clear();
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete account data:', err);
      alert('Encountered an issue deleting account data. Signing out now.');
      localStorage.clear();
      await signOut();
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      persona,
      dailyIntention,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Export JSON backup
  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      theme,
      routines,
      todos,
      reflections,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitale_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.routines) localStorage.setItem('habitale_routines', JSON.stringify(data.routines));
        if (data.todos) localStorage.setItem('habitale_todos', JSON.stringify(data.todos));
        if (data.reflections) localStorage.setItem('habitale_reflections', JSON.stringify(data.reflections));
        if (data.theme) localStorage.setItem('habitale_theme_config', JSON.stringify(data.theme));
        alert('Data successfully imported! The page will now reload.');
        window.location.reload();
      } catch (err) {
        alert('Invalid Habitale backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSamplePack = () => {
    if (confirm('Load starter rituals and to-dos? This will refresh your current list.')) {
      loadStarterRoutines();
      loadStarterTodos();
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '980px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--text-main)', marginBottom: '4px' }}>
          Settings & Account Sanctuary
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Manage your identity, personal sanctuary, sensory preferences, and backups.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <User size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Your Identity</h3>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--bg-canvas)',
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Persona Vibe
                </label>
                <input
                  type="text"
                  value={persona}
                  onChange={e => setPersona(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--bg-canvas)',
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Daily Intention / Mantra
              </label>
              <input
                type="text"
                value={dailyIntention}
                onChange={e => setDailyIntention(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--card-border)',
                  backgroundColor: 'var(--bg-canvas)',
                  fontSize: '0.92rem',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Account Email: <strong>{user?.email || 'local@habitale.app'}</strong>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                {profileSaved ? (
                  <>
                    <Check size={14} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>



        {/* Data Backup & Portability Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Download size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
              Data Ownership & Portability
            </h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
            Your data belongs to you. Export a full JSON archive of your routines, to-dos, themes, and journals anytime.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={handleExportData} className="btn btn-secondary btn-sm">
              <Download size={15} />
              <span>Export All Data (JSON)</span>
            </button>

            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={15} />
              <span>Restore from Backup</span>
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>

            <button onClick={handleResetSamplePack} className="btn btn-outline btn-sm">
              <RotateCcw size={15} />
              <span>Reset to Sample Starter Pack</span>
            </button>
          </div>
        </div>

        {/* Revisit Onboarding Card */}
        <div
          className="card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--card-bg)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Revisit Onboarding
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Re-run the 5-step personalization wizard to adjust your themes, routines, and lighting.
            </div>
          </div>
          <button onClick={restartOnboarding} className="btn btn-outline btn-sm">
            <Compass size={14} />
            <span>Restart Onboarding</span>
          </button>
        </div>

        {/* Account Log Out */}
        <div
          className="card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-canvas-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Sign Out of Session
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              You can return anytime; your saved habits and reflections will remain intact.
            </div>
          </div>
          <button onClick={signOut} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div
          className="card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid rgba(223, 123, 123, 0.4)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} />
              <span>Danger Zone: Permanent Account Deletion</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Permanently delete your profile, routines, to-dos, reflections, and custom themes.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeletingAccount}
            className="btn btn-sm"
            style={{
              backgroundColor: 'var(--danger)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(223, 123, 123, 0.35)',
            }}
          >
            <Trash2 size={14} />
            <span>{isDeletingAccount ? 'Deleting...' : 'Delete My Account'}</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account?"
        message="Are you sure you want to delete your Habitale account? All your routines, completion records, to-do lists, and reflections will be irreversibly erased. This action cannot be undone."
        confirmLabel="Yes, Erase Everything"
        cancelLabel="Keep My Account"
        isDestructive={true}
      />
    </div>
  );
};
