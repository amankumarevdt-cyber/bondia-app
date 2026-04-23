import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginApi, logoutApi } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { saveToken, getToken, saveUser, getUser, clearAll } from '../utils/storage';

const AuthContext = createContext();

const DEBUG_AUTH = typeof __DEV__ === 'boolean' ? __DEV__ : true; // temporary (dev-only)

function pickTokenFromResponse(responseData) {
  if (!responseData) return null;
  if (typeof responseData === 'string') return null;
  if (typeof responseData !== 'object') return null;

  // Supported shapes:
  // - { token: '...' }
  // - { data: { token: '...' } }
  // - { data: { data: { token: '...' } } }
  return (
    responseData.token ||
    responseData?.data?.token ||
    responseData?.data?.data?.token ||
    null
  );
}

function pickUserFromResponse(responseData, fallbackMobile) {
  if (!responseData || typeof responseData !== 'object') return { mobile: fallbackMobile };
  const u =
    responseData.user ||
    responseData?.data?.user ||
    responseData?.data?.data?.user ||
    null;
  return u || { mobile: fallbackMobile };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (e) {
      if (DEBUG_AUTH) {
        // eslint-disable-next-line no-console
        console.log('[AUTH]', 'logout API failed (continuing to clear session):', e?.message);
      }
    } finally {
      await clearAll();
      setUser(null);
      setIsLoggedIn(false);
    }
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
        if (DEBUG_AUTH) {
          // eslint-disable-next-line no-console
          console.log('[AUTH]', 'session restored');
        }
      }
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (mobile, password) => {
    const response = await loginApi(mobile, password);
    const body = response?.data;

    if (DEBUG_AUTH) {
      // eslint-disable-next-line no-console
      console.log('[AUTH]', 'login response:', body);
    }

    const token = pickTokenFromResponse(body);
    const userData = pickUserFromResponse(body, mobile);

    if (!token) {
      throw new Error('Login failed. No token received.');
    }

    await saveToken(String(token));
    await saveUser(userData);

    setUser(userData);
    setIsLoggedIn(true);

    return body;
};

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
