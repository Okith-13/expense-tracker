import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Demo users stored in localStorage
const USERS_KEY = 'flo_users';
const SESSION_KEY = 'flo_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const users = getUsers();
        const u = users[session];
        if (u) setUser({ email: session, name: u.name });
      } catch {}
    }
    setLoading(false);
  }, []);

  const signup = (name, email, password) => {
    const users = getUsers();
    if (users[email]) return { error: 'Account already exists for this email.' };
    users[email] = { name, password, createdAt: new Date().toISOString() };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, email);
    setUser({ email, name });
    return { success: true };
  };

  const login = (email, password) => {
    const users = getUsers();
    const u = users[email];
    if (!u) return { error: 'No account found with this email.' };
    if (u.password !== password) return { error: 'Incorrect password.' };
    localStorage.setItem(SESSION_KEY, email);
    setUser({ email, name: u.name });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
