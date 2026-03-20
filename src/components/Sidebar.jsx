import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, PlusCircle, AlertTriangle,
  Shield, User, Bell, LogOut, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user, logout, unreadCount, isFaculty } = useAuth();
  const navigate = useNavigate();

  const NAV = [
    { to: '/',           icon: LayoutDashboard, label: 'Dashboard'     },
    { to: '/complaints', icon: ClipboardList,   label: isFaculty ? 'All Complaints' : 'My Complaints' },
    { to: '/add',        icon: PlusCircle,      label: 'New Complaint' },
    { to: '/urgent',     icon: AlertTriangle,   label: 'Urgent / Open'  },
  ];

  const ACCOUNT = [
    { to: '/profile',       icon: User,   label: 'My Profile' },
    {
      to: '/notifications', icon: Bell,   label: 'Notifications',
      badge: unreadCount > 0 ? String(unreadCount) : null,
    },
    ...(isFaculty ? [{ to: '/admin', icon: Shield, label: 'Faculty Panel' }] : []),
  ];

  // Avatar initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 39, display: 'none' }}
          className="sidebar-overlay"
        />
      )}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 'var(--sidebar-w)',
          background: 'var(--blue-950)',
          borderRight: '1px solid rgba(255,255,255,.06)',
          display: 'flex', flexDirection: 'column',
          zIndex: 40, transition: 'transform var(--transition)',
        }}
        className={`sidebar ${open ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: '0 24px', height: 'var(--navbar-h)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--blue-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '-0.5px',
            }}>AU</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, letterSpacing: '-0.2px' }}>CMS</div>
              <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 10, marginTop: -2 }}>
                {isFaculty ? 'Faculty' : 'Student'} Portal
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', display: 'none', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav section label */}
        <div style={{ padding: '20px 24px 8px', color: 'rgba(255,255,255,.25)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Home
        </div>

        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to} to={to} end={to === '/'} onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
                background: isActive ? 'rgba(59,130,246,.18)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--blue-400)' : '2px solid transparent',
                fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                transition: 'all var(--transition)', textDecoration: 'none',
              })}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{ background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          <div style={{ margin: '16px 0 8px', height: 1, background: 'rgba(255,255,255,.06)' }} />
          <div style={{ padding: '0 0 8px', color: 'rgba(255,255,255,.25)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Account
          </div>

          {ACCOUNT.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to} to={to} onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                color: isActive ? '#fff' : 'rgba(255,255,255,.45)',
                background: isActive ? 'rgba(59,130,246,.12)' : 'transparent',
                fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                transition: 'all var(--transition)', textDecoration: 'none',
              })}
            >
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User badge + logout */}
        <div style={{ margin: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.07)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}
            onClick={() => { navigate('/profile'); onClose(); }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
            }}>{initials}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName}
              </div>
              <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>
                {user?.role} · {user?.userId}
              </div>
            </div>
            <ChevronRight size={13} color="rgba(255,255,255,.25)" />
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              padding: '7px 10px', borderRadius: 7,
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.2)',
              color: '#fca5a5', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
        .sidebar nav a:hover {
          color: rgba(255,255,255,.85) !important;
          background: rgba(255,255,255,.06) !important;
        }
      `}</style>
    </>
  );
}
