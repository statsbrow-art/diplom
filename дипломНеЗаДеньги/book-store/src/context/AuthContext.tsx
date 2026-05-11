import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'bookstore_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          if (userData && !userData.error) {
            setUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem(USER_KEY);
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.login(email, password);
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      if (result.user && result.token) {
        setUser(result.user);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        return { success: true };
      }
      
      return { success: false, error: 'Ошибка входа' };
    } catch (error) {
      return { success: false, error: 'Ошибка сервера' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await api.register({ name, email, password, phone });
      
      if (result.error) {
        return { success: false, error: result.error };
      }
      
      if (result.user && result.token) {
        setUser(result.user);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        return { success: true };
      }
      
      return { success: false, error: 'Ошибка регистрации' };
    } catch (error) {
      return { success: false, error: 'Ошибка сервера' };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
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
