import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getStoredUser());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api.fetchMe();
      setUser(data.user);
      api.setAuth(token, data.user);
      return data.user;
    } catch {
      api.clearAuth();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    return api.register(payload);
  };

  const logout = () => {
    api.clearAuth();
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    const token = api.getToken();
    if (token) api.setAuth(token, updated);
  };

  const isAdmin = user?.roles?.includes("ADMIN");

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, updateUser, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
