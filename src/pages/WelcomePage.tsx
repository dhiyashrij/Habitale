import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Feather,
  ShieldCheck,
  AlertCircle,
  X,
  CheckCircle2,
  Heart,
  Calendar,
  Compass,
} from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const {
    signInWithGoogle,
    isAuthenticating,
    authError,
    authSuccess,
    clearAuthError,
  } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Delicate background ambient botanical glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 155, 170, 0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 184, 159, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Navbar */}
      <header
        style={{
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(217, 155, 170, 0.35)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
              }}
            >
              Habitale
            </span>
          </div>
        </div>

      </header>

      {/* Main Login Hero */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '20px 24px 60px 24px',
          maxWidth: '840px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Tagline Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 18px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.84rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '22px',
          }}
        >
          <Feather size={14} />
          <span>Your habits, your story.</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 500,
            lineHeight: 1.15,
            color: 'var(--text-main)',
            marginBottom: '18px',
            letterSpacing: '-0.02em',
          }}
        >
          An aesthetic sanctuary for your daily rituals and gentle progress.
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'var(--text-muted)',
            maxWidth: '640px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          Sign in with your Google account to customize your personal workspace, craft recurring routines, manage intentional to-dos, and synchronize your progress in the cloud.
        </p>

        {/* Feedback / Error / Cancellation Banner */}
        {authError && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid rgba(223, 123, 123, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              maxWidth: '600px',
              width: '100%',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              textAlign: 'left',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <AlertCircle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#902C2C', marginBottom: '2px' }}>
                Sign-In Notice
              </div>
              <p style={{ fontSize: '0.84rem', color: '#6A2323', lineHeight: 1.45 }}>
                {authError}
              </p>
            </div>
            <button
              onClick={clearAuthError}
              style={{ padding: '4px', color: '#902C2C', borderRadius: '50%' }}
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Success Banner */}
        {authSuccess && (
          <div
            style={{
              backgroundColor: 'var(--success-light)',
              border: '1px solid rgba(136, 183, 149, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              maxWidth: '600px',
              width: '100%',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
            }}
          >
            <CheckCircle2 size={18} color="var(--success)" />
            <span style={{ fontSize: '0.88rem', color: '#2B5A37', fontWeight: 600 }}>
              Authenticated with Google! Entering your sanctuary...
            </span>
          </div>
        )}

        {/* Google Sign-In Action Card */}
        <div
          className="card"
          style={{
            padding: '32px 40px',
            maxWidth: '460px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
            boxShadow: 'var(--card-shadow-hover)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              Welcome to Habitale
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Sign in to start or continue your journey.
            </p>
          </div>

          {/* Continue with Google Button */}
          <button
            onClick={signInWithGoogle}
            disabled={isAuthenticating}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '0.98rem',
              fontWeight: 600,
              boxShadow: '0 6px 18px rgba(217, 155, 170, 0.4)',
              cursor: isAuthenticating ? 'not-allowed' : 'pointer',
              opacity: isAuthenticating ? 0.8 : 1,
            }}
          >
            {isAuthenticating ? (
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#ffffff',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G Logo */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                  </svg>
                </div>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Secure indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
            }}
          >
            <ShieldCheck size={14} color="var(--secondary)" />
            <span>Authenticated directly with Google OAuth & Firebase</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Compass size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>First-Time Onboarding</h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Choose your starter theme, pick light or dark mode, and establish your first routine in a calm 5-step journey.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Heart size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Cloud Synchronized</h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Every routine, to-do, and daily reflection is stored securely under your private Firebase account in Cloud Firestore.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Calendar size={18} color="var(--secondary)" />
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Your Habits, Your Story</h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Track streaks and progress with gentle chimes, serene heatmaps, and customizable aesthetics.
            </p>
          </div>
        </div>
      </main>



      {/* Footer */}
      <footer
        style={{
          padding: '24px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--card-border)',
        }}
      >
        Habitale &copy; {new Date().getFullYear()} — Your habits, your story. Crafted for calm, intentional living.
      </footer>
    </div>
  );
};
