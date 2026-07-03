import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getToken, saveAuth, clearAuth, isLoggedIn } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(getUser());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const login = (token, userData) => {
    saveAuth(token, userData);
    setUser(userData);
    setLoggedIn(true);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, loggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
