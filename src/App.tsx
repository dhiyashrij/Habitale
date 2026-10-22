import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RoutinesProvider } from './context/RoutinesContext';
import { TodosProvider } from './context/TodosContext';
import { ReflectionProvider } from './context/ReflectionContext';

// Navigation & Layout
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { WelcomePage } from './pages/WelcomePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { TodosPage } from './pages/TodosPage';
import { ThemeStudioPage } from './pages/ThemeStudioPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CosmicFocusPage } from './pages/CosmicFocusPage';

const HabitaleApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-canvas)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--primary-light)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
          Opening your sanctuary...
        </span>
      </div>
    );
  }

  // 1. Welcome / Real Google Sign In Page (Protects all private routes)
  if (!user) {
    return <WelcomePage />;
  }

  // 2. First-Time 5-Step Onboarding
  if (!user.onboardingCompleted) {
    return <OnboardingPage onComplete={() => setCurrentPage('dashboard')} />;
  }

  // 3. Main Authenticated Application with Sidebar & MobileNav
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateToTodos={() => setCurrentPage('todos')}
            onNavigateToFocus={() => setCurrentPage('cosmic-focus')}
          />
        );
      case 'routines':
        return <RoutinesPage />;
      case 'todos':
        return <TodosPage />;
      case 'cosmic-focus':
        return <CosmicFocusPage />;
      case 'theme':
        return <ThemeStudioPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            onNavigateToTodos={() => setCurrentPage('todos')}
            onNavigateToFocus={() => setCurrentPage('cosmic-focus')}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Page Area */}
      <main className="main-content">
        {renderCurrentPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RoutinesProvider>
          <TodosProvider>
            <ReflectionProvider>
              <HabitaleApp />
            </ReflectionProvider>
          </TodosProvider>
        </RoutinesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
