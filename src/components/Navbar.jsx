import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, RefreshCw, X, LogOut, User, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TITLES = {
  '/':            'Dashboard',
  '/complaints':  'All Complaints',
  '/add':         'New Complaint',
  '/urgent':      'Urgent Complaints',
  '/profile':     'My Profile',
  '/notifications':'Notifications',
  '/admin':       'Faculty Panel',
};

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, unreadCount, isFaculty } = useAuth();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/complaints?search=${encodeURIComponent(search.trim())}`); setSearch(''); setSearching(false); }
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 'var(--sidebar-w)', right: 0,
      height: 'var(--navbar-h)', background: 'rgba(250,250,250,.96)',
      backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--gray-200)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, zIndex: 30,
    }} className="navbar">
      <button onClick={onMenuClick} style={{ background: 'none', border: 'none', color: 'var(--gray-600)', padding: 6, borderRadius: 6, display: 'none', alignItems: 'center' }} className="menu-btn"><Menu size={20} /></button>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 17, fontWeight: 600, color: 'var(--gray-900)', letterSpacing: '-0.3px' }}>{TITLES[pathname] || 'Page'}</h1>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: -1 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
      {searching ? (
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints…" style={{ border: '1.5px solid var(--blue-400)', borderRadius: 8, padding: '6px 12px', fontSize: 13, outline: 'none', background: '#fff', color: 'var(--gray-900)', width: 220 }} />
          <button type="button" onClick={() => setSearching(false)} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', padding: 4 }}><X size={16} /></button>
        </form>
      ) : (
        <button onClick={() => setSearching(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '7px 14px', color: 'var(--gray-500)', fontSize: 13, cursor: 'pointer' }}>
          <Search size={14} /><span className="search-text">Search…</span>
          <kbd style={{ background: 'var(--gray-200)', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gray-500)' }}>⌘K</kbd>
        </button>
      )}
      <button onClick={() => window.location.reload()} title="Refresh" style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 7, color: 'var(--gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><RefreshCw size={15} /></button>
      <button onClick={() => navigate('/notifications')} title="Notifications" style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 7, color: 'var(--gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Bell size={15} />
        {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 99, background: '#ef4444', border: '2px solid #fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', padding: '0 3px' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button onClick={() => setUserMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '5px 12px 5px 6px', cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>{user?.fullName?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.2 }}>{user?.fullName?.split(' ')[0]}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{user?.role}</div>
          </div>
          <ChevronDown size={12} color="var(--gray-400)" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {userMenuOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 6, minWidth: 200, boxShadow: '0 8px 30px rgba(0,0,0,.12)', animation: 'fadeIn .15s ease both', zIndex: 50 }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{user?.fullName}</div>
              <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>{user?.email} · {user?.userId}</div>
            </div>
            {[
              { icon: User, label: 'My Profile', to: '/profile' },
              { icon: Bell, label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, to: '/notifications' },
              ...(isFaculty ? [{ icon: Shield, label: 'Faculty Panel', to: '/admin' }] : []),
            ].map(item => (
              <button key={item.to} onClick={() => { navigate(item.to); setUserMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-700)', fontSize: 13, fontWeight: 500, textAlign: 'left' }}>
                <item.icon size={14} color="var(--gray-400)" />{item.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--gray-100)', margin: '4px 0' }} />
            <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 500, textAlign: 'left' }}>
              <LogOut size={14} color="#ef4444" /> Sign Out
            </button>
          </div>
        )}
      </div>
      <style>{`@media(max-width:768px){.navbar{left:0!important}.menu-btn{display:flex!important}.search-text{display:none}.user-info{display:none}}`}</style>
    </header>
  );
}
