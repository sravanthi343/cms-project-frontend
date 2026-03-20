import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { STATUS_META, CATEGORY_META, timeAgo, truncate } from '../utils/helpers';

export default function Urgent() {
  const { isFaculty } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintAPI.getAll();
      const all = res.data || [];
      // "Urgent" = complaints that are OPEN or IN_PROGRESS (unresolved)
      const urgent = all
        .filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first = most urgent
      setComplaints(urgent);
    } catch (err) {
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
        borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#fca5a5" />
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>
              Urgent / Unresolved Complaints
            </h2>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>
              {isFaculty ? 'Open & In-Progress complaints needing attention' : 'Your unresolved complaints'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fca5a5', letterSpacing: '-1px' }}>
              {loading ? '…' : complaints.length}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600, textTransform: 'uppercase' }}>Unresolved</div>
          </div>
          <button onClick={load} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
            color: '#fca5a5', fontSize: 12, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: 160, borderRadius: 'var(--radius-md)',
              background: 'var(--gray-100)', animation: 'pulse 2s infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)', padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>All caught up!</h3>
          <p style={{ fontSize: 13.5, color: 'var(--gray-400)' }}>No open or in-progress complaints. Great work!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {complaints.map(c => {
            const sm = STATUS_META[c.status] || STATUS_META.OPEN;
            const cm = CATEGORY_META[c.category] || { label: c.category, icon: '📝' };
            // Calculate how many hours old
            const hoursOld = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 3600000);
            const isOld    = hoursOld >= 24;
            return (
              <div key={c.id} style={{
                background: '#fff',
                border: `1px solid ${isOld ? '#fecaca' : 'var(--gray-200)'}`,
                borderRadius: 'var(--radius-md)', padding: '18px 20px',
                position: 'relative', overflow: 'hidden',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Age indicator stripe */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                  background: isOld ? '#ef4444' : '#f59e0b',
                  borderRadius: '10px 0 0 10px',
                }} />

                {isOld && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 6, padding: '2px 8px',
                    fontSize: 10, fontWeight: 700, color: '#dc2626',
                  }}>
                    {hoursOld}h overdue
                  </div>
                )}

                <div style={{ marginLeft: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{cm.icon}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>
                      #{c.id} · {cm.label}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 6, lineHeight: 1.4 }}>
                    {truncate(c.title, 65)}
                  </h3>

                  {c.description && (
                    <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 10 }}>
                      {truncate(c.description, 90)}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                      background: sm.bg, color: sm.color,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot }} />
                      {sm.label}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--gray-600)', fontWeight: 500 }}>
                        {c.raisedByName}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
}
