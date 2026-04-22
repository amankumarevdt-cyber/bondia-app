import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginApi } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { saveToken, getToken, saveUser, getUser, clearAll } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await clearAll();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    restoreSession();
  }, [logout]);

  const restoreSession = async () => {
    try {
      const token = await getToken();
      const stored = await getUser();
      if (token && stored) {
        setUser(stored);
        setIsLoggedIn(true);
      }
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (mobile, password) => {
  const response = await loginApi(mobile, password);

  const apiData = response.data?.data;

  const token = apiData?.token;
  const userData = apiData?.user;

  if (!token) {
    throw new Error('Login failed. No token received.');
  }

  await saveToken(token);
  await saveUser(userData || { mobile });

  setUser(userData || { mobile });
  setIsLoggedIn(true);

  return response.data;
};

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
