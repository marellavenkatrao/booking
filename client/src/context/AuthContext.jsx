import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nec_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch official faculty and coordinator directory
        const res = await authApi.getDemoUsers();
        setDemoAccounts(res.data.users || []);

        // Verify active session if token exists
        const token = localStorage.getItem('nec_token');
        if (token) {
          try {
            const meRes = await authApi.getMe();
            if (meRes.data.user) {
              setUser(meRes.data.user);
              localStorage.setItem('nec_user', JSON.stringify(meRes.data.user));
            }
          } catch (err) {
            console.warn('Session expired, clearing tokens');
            localStorage.removeItem('nec_token');
            localStorage.removeItem('nec_user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to load accounts directory', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { token, user: loggedUser } = res.data;
    localStorage.setItem('nec_token', token);
    localStorage.setItem('nec_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const demoLogin = async (userId) => {
    const res = await authApi.demoLogin(userId);
    const { token, user: loggedUser } = res.data;
    localStorage.setItem('nec_token', token);
    localStorage.setItem('nec_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const switchRole = async (newRole) => {
    try {
      const res = await authApi.switchRole(newRole);
      const updatedUser = res.data.user;
      localStorage.setItem('nec_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.warn('Server role switch failed, applying locally', err);
      if (user && (user.roles?.includes(newRole) || user.role === newRole)) {
        const updated = { ...user, role: newRole };
        localStorage.setItem('nec_user', JSON.stringify(updated));
        setUser(updated);
        return updated;
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('nec_token');
    localStorage.removeItem('nec_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, demoAccounts, login, demoLogin, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
