import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  updateTopics: (topics: string[]) => Promise<void>;
  updateInterests: (subcategories: string[]) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * Initiates Google OAuth 2.0 Web Server redirect through backend
   */
  const loginWithGoogle = () => {
    window.location.href = api.auth.googleUrl;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  };

  const updateTopics = async (topics: string[]) => {
    const res = await api.users.updateTopics(topics);
    setUser(res.user);
  };

  const updateInterests = async (subcategories: string[]) => {
    const res = await api.users.updateInterests(subcategories);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        logout,
        updateTopics,
        updateInterests,
        refreshUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
