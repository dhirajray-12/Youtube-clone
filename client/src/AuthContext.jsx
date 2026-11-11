import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = ({ token, user }) => {
    setToken(token);
    setUser(user);
  };

  const value = {
    user,
    loading,
    setUser,
    login: async (login, password) => handleAuth(await api('/auth/login', { body: { login, password } })),
    register: async (form) => handleAuth(await api('/auth/register', { body: form })),
    logout: () => {
      setToken(null);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
