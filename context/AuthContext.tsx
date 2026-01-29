import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MockBackend } from '../services/mockBackend';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, businessName: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('qorvyn_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const foundUser = await MockBackend.login(email, password);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('qorvyn_session', JSON.stringify(foundUser));
      } else {
        alert('Invalid credentials. If using demo, password is "password"');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, businessName: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser = await MockBackend.register(name, email, businessName, password);
      setUser(newUser);
      localStorage.setItem('qorvyn_session', JSON.stringify(newUser));
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qorvyn_session');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};