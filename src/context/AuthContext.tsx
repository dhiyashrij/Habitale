import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import {
  isReady as isFirebaseReady,
  initializeFirebaseApp,
  signInWithGooglePopup,
  signOutFirebase,
  formatFirebaseAuthError,
} from '../services/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  authSuccess: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: {
    displayName?: string;
    starterTheme?: string;
    colorMode?: 'light' | 'dark';
    initialRoutineTitle?: string;
  }) => Promise<void>;
  restartOnboarding: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);

  // Listen to real Firebase Auth state changes
  useEffect(() => {
    const { auth: activeAuth, isReady } = initializeFirebaseApp();
    if (!activeAuth || !isReady) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(activeAuth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const storageKey = `habitale_profile_${fbUser.uid}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser({
              ...parsed,
              id: fbUser.uid,
              email: fbUser.email || parsed.email || '',
              displayName: parsed.displayName || fbUser.displayName || 'Gentle Soul',
              photoURL: fbUser.photoURL || parsed.photoURL,
            });
          } catch {
            const profile: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Gentle Soul',
              photoURL: fbUser.photoURL || undefined,
              onboardingCompleted: true,
              createdAt: new Date().toISOString(),
            };
            setUser(profile);
            localStorage.setItem(storageKey, JSON.stringify(profile));
          }
        } else {
          // New profile created from Google Auth credentials
          const profile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Gentle Soul',
            photoURL: fbUser.photoURL || undefined,
            onboardingCompleted: false,
            createdAt: new Date().toISOString(),
          };
          setUser(profile);
          localStorage.setItem(storageKey, JSON.stringify(profile));
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    setAuthSuccess(false);

    try {
      await signInWithGooglePopup();
      setAuthSuccess(true);
      // State will update in onAuthStateChanged
    } catch (err: unknown) {
      console.error('Google Sign-in error:', err);
      const friendlyMessage = formatFirebaseAuthError(err);
      setAuthError(friendlyMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(`habitale_profile_${user.id}`, JSON.stringify(updated));
  };

  const completeOnboarding = async (data: {
    displayName?: string;
    starterTheme?: string;
    colorMode?: 'light' | 'dark';
    initialRoutineTitle?: string;
  }) => {
    if (!user) return;

    const updated: UserProfile = {
      ...user,
      displayName: data.displayName || user.displayName,
      starterTheme: data.starterTheme || user.starterTheme || 'blush',
      colorMode: data.colorMode || 'light',
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    setUser(updated);
    localStorage.setItem(`habitale_profile_${user.id}`, JSON.stringify(updated));
  };

  const restartOnboarding = () => {
    if (!user) return;
    setUser(prev => (prev ? { ...prev, onboardingCompleted: false } : null));
  };

  const signOut = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setFirebaseUser(null);
    setUser(null);
    setAuthSuccess(false);
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticating,
        authError,
        authSuccess,
        isFirebaseConfigured: isFirebaseReady,
        signInWithGoogle,
        signOut,
        updateProfile,
        completeOnboarding,
        restartOnboarding,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
