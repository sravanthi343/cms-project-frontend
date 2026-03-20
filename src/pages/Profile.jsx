import { useState, useEffect } from 'react';
import { User, Mail, Shield, Clock, ClipboardList, CheckCircle, AlertTriangle, Edit2, X, Save, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import { STATUS_META, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, isFaculty, updateProfile } = useAuth();
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Edit modal state
  const [editOpen, setEditOpen]   = useState(false);
  const [editForm, setEditForm]   = useState({ fullName: '', phone: '' });
  const [editErr, setEditErr]     = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await complaintAPI.getAll();
        setMyComplaints(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load complaints');
      } finally { setLoading(false); }
    };
    if (user) load();
  }, [user]);

  const openEdit = () => {
    setEditForm({ fullName: user?.fullName || '', phone: user?.phone || '' });
    setEditErr({});
    setEditOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.fullName.trim()) errs.fullName = 'Name is required';
    if (Object.keys(errs).length) { setEditErr(errs); return; }
    setSaving(true);
    try {
      updateProfile({ fullName: editForm.fullName.trim(), phone: editForm.phone.trim() });
      toast.success('Profile updated!');
      setEditOpen(false);
    } catch {
      toast.error('Failed to save changes');
    } finally { setSaving(false); }
  };

  const stats = {
    total:      myComplaints.length,
    open:       myComplaints.filter(c => c.status === 'OPEN').length,
    inProgress: myComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved:   myComplaints.filter(c => c.status === 'RESOLVED').length,
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div style={{ maxWidth: 900, animation: 'fadeIn .35s ease both' }}>

      {/* Profile card */}
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--blue-700), var(--blue-900))', height: 100, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        </div>

        <div style={{ padding: '0 32px 28px', position: 'relative' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 26,
            border: '4px solid #fff', position: 'absolute', top: -40,
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
          }}>{initials}</div>

          <div style={{ paddingTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>{user?.fullName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: isFaculty ? '#ecfdf5' : '#eff6ff',
                    color: isFaculty ? '#059669' : '#2563eb',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Shield size={10} /> {user?.role}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    ID: <code style={{ fontFamily: 'monospace', fontSize: 12 }}>{user?.userId}</code>
                  </span>
                </div>
              </div>

              <button onClick={openEdit} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 9,
                border: '1.5px solid var(--gray-200)', background: '#fff',
                color: 'var(--gray-700)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--blue-400)'; e.currentTarget.style.color='var(--blue-600)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray-200)'; e.currentTarget.style.color='var(--gray-700)'; }}
              >
                <Edit2 size={13} /> Edit Profile
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }} className="profile-grid">
              <InfoField icon={<Mail size={14} />}   label="Email Address" value={user?.email} />
              <InfoField icon={<User size={14} />}   label="User ID"       value={<code style={{ fontFamily: 'monospace', fontSize: 13 }}>{user?.userId}</code>} />
              <InfoField icon={<Shield size={14} />} label="Role"          value={user?.role} />
              <InfoField icon={<Clock size={14} />}  label="Phone"         value={user?.phone || <span style={{ color: 'var(--gray-300)', fontStyle: 'italic', fontSize: 13 }}>Not set — click Edit Profile</span>} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="stats-4">
        {[
          { label: 'Total',       value: stats.total,      icon: ClipboardList, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Open',        value: stats.open,       icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock,         color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Resolved',    value: stats.resolved,   icon: CheckCircle,   color: '#059669', bg: '#ecfdf5' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={14} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-1px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Complaints list */}
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 16 }}>
          {isFaculty ? 'All Complaints Overview' : 'My Complaints'}
        </h3>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#dc2626', fontSize: 13 }}>⚠️ {error}</div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-400)', fontSize: 13 }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--blue-200)', borderTopColor: 'var(--blue-600)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
            Loading…
          </div>
        ) : myComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 13 }}>{isFaculty ? 'No complaints yet.' : "You haven't submitted any complaints yet."}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(c => {
              const sm = STATUS_META[c.status] || STATUS_META.OPEN;
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 8, border: '1px solid var(--gray-100)', background: '#fafafa' }}>
                  <div style={{ width: 3, height: 36, borderRadius: 99, background: sm.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>
                      {c.category} · {timeAgo(c.createdAt)}
                      {isFaculty && <span style={{ marginLeft: 6, color: 'var(--gray-500)' }}>by {c.raisedByName} ({c.raisedBy})</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: sm.bg, color: sm.color, whiteSpace: 'nowrap' }}>{sm.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setEditOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,.25)', animation: 'fadeIn .2s ease both', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={15} color="var(--blue-600)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>Edit Profile</h3>
                  <p style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 1 }}>Update your display information</p>
                </div>
              </div>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4, borderRadius: 6, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={labelSt}>User ID</label>
                  <div style={roSt}>{user?.userId}</div>
                </div>
                <div>
                  <label style={labelSt}>Email</label>
                  <div style={{ ...roSt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  value={editForm.fullName}
                  onChange={e => { setEditForm(f => ({ ...f, fullName: e.target.value })); setEditErr({}); }}
                  placeholder="Your full name"
                  style={inpSt(editErr.fullName)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = editErr.fullName ? '#ef4444' : '#e4e4e7'}
                />
                {editErr.fullName && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>{editErr.fullName}</p>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelSt}>Phone <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  style={inpSt(false)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e4e4e7'}
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', marginBottom: 20, fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5 }}>
                ℹ️ User ID, email and role are managed by the system and cannot be changed.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditOpen(false)} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--gray-200)', borderRadius: 9, background: '#fff', color: 'var(--gray-600)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', background: saving ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: saving ? 'none' : '0 4px 14px rgba(37,99,235,.3)' }}>
                  {saving ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .stats-4 { grid-template-columns: 1fr 1fr !important; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const InfoField = ({ icon, label, value }) => (
  <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px 14px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--gray-400)' }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
    </div>
    <div style={{ fontSize: 13.5, color: 'var(--gray-800)', fontWeight: 500 }}>{value}</div>
  </div>
);

const labelSt = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 5 };
const roSt    = { padding: '9px 12px', borderRadius: 8, background: 'var(--gray-50)', border: '1.5px solid var(--gray-100)', fontSize: 13, color: 'var(--gray-500)', fontFamily: 'monospace' };
const inpSt   = (err) => ({ width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: `1.5px solid ${err ? '#ef4444' : '#e4e4e7'}`, borderRadius: 8, fontSize: 13.5, outline: 'none', background: '#fff', color: 'var(--gray-900)', transition: 'border-color .15s', fontFamily: 'var(--font-body)' });
