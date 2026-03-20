import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'cms_session';
const NOTIFICATIONS_KEY = 'cms_notifications';

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function saveSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Notification helpers (client-side only) ───────────────────────────────────
export function getNotifications(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    return all[userId] || [];
  } catch { return []; }
}
export function addNotification(userId, notification) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    const userNotifs = all[userId] || [];
    userNotifs.unshift({
      ...notification,
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    });
    all[userId] = userNotifs.slice(0, 50);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  } catch {}
}
export function markAllRead(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    if (all[userId]) all[userId] = all[userId].map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const session = getSession();
    if (session?.token) {
      setUser(session);
      setNotifications(getNotifications(session.userId));
    }
    setLoading(false);
  }, []);

  const refreshNotifications = useCallback(() => {
    if (user) setNotifications(getNotifications(user.userId));
  }, [user]);

  /**
   * Login using userId + password (backend LoginRequest)
   * Returns the session user object.
   */
  const login = useCallback(async (userId, password) => {
    // ApiResponse<AuthResponse>  →  { success, message, data: { token, userId, fullName, email, role } }
    const res = await authAPI.login({ userId, password });
    const authData = res.data;   // unwrapped by interceptor → ApiResponse obj
    const session = {
      token:    authData.token,
      userId:   authData.userId,
      fullName: authData.fullName,
      email:    authData.email,
      role:     authData.role,   // "STUDENT" | "FACULTY"
    };
    saveSession(session);
    setUser(session);
    setNotifications(getNotifications(session.userId));
    addNotification(session.userId, {
      type: 'welcome',
      title: 'Logged in successfully',
      message: `Welcome back, ${session.fullName}!`,
    });
    return session;
  }, []);

  /**
   * Register a new user. Backend requires: fullName, email, password, userId, role.
   */
  const register = useCallback(async ({ fullName, email, password, userId, role }) => {
    const res = await authAPI.register({ fullName, email, password, userId, role });
    const authData = res.data;
    const session = {
      token:    authData.token,
      userId:   authData.userId,
      fullName: authData.fullName,
      email:    authData.email,
      role:     authData.role,
    };
    saveSession(session);
    setUser(session);
    setNotifications(getNotifications(session.userId));
    addNotification(session.userId, {
      type: 'welcome',
      title: 'Account created!',
      message: `Welcome to CMS, ${session.fullName}!`,
    });
    return session;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setNotifications([]);
  }, []);

  /**
   * Update local session fields (fullName, phone).
   * These are client-side only — the backend has no profile-update endpoint.
   * userId, email, role are immutable.
   */
  const updateProfile = useCallback((updates) => {
    const allowed = {};
    if (updates.fullName !== undefined) allowed.fullName = updates.fullName;
    if (updates.phone    !== undefined) allowed.phone    = updates.phone;
    const updated = { ...user, ...allowed };
    saveSession(updated);
    setUser(updated);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isFaculty   = user?.role === 'FACULTY';

  return (
    <AuthContext.Provider value={{
      user, loading, notifications, unreadCount,
      login, register, logout, updateProfile, refreshNotifications,
      isFaculty,
      // Keep isAdmin alias pointing to FACULTY for UI compatibility
      isAdmin: isFaculty,
      markAllRead: () => {
        markAllRead(user?.userId);
        setNotifications(n => n.map(x => ({ ...x, read: true })));
      },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
