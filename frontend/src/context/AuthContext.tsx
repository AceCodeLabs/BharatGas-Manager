import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '../../../shared/types';
import { clearToken, getToken, setToken } from '@/shared/api/client';
import { authApi } from '@/services/authApi';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const response = await authApi.me();
    setUser(response.user);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    login: async (email, password) => {
      const response = await authApi.login(email, password);
      setToken(response.token);
      setUser(response.user);
    },
    register: async (email, password) => {
      const response = await authApi.register(email, password);
      setToken(response.token);
      setUser(response.user);
    },
    logout: () => {
      clearToken();
      setUser(null);
    },
    refreshProfile,
  }), [loading, user]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
