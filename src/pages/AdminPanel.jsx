import { useState, useEffect } from 'react';
import { Users, ClipboardList, AlertTriangle, CheckCircle, Clock, Eye, Filter, RefreshCw } from 'lucide-react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { STATUS_META, STATUS_TRANSITIONS, CATEGORY_META, timeAgo, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

// Backend statuses only
const FILTER_STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function AdminPanel() {
  const { isFaculty } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected]     = useState(null);   // complaint id for detail modal
  const [updating, setUpdating]     = useState(null);   // id currently being updated

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintAPI.getAll();
      setComplaints(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleStatusChange = async (complaint, newStatus) => {
    if (complaint.status === newStatus) return;
    setUpdating(complaint.id);
    try {
      // PUT /api/complaints/{id}/status?status=IN_PROGRESS
      const res = await complaintAPI.updateStatus(complaint.id, newStatus);
      const updated = res.data;
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast.success(`Status updated to ${STATUS_META[newStatus]?.label || newStatus}`);
      // If detail modal is open for this complaint, update it
      if (selected === complaint.id) setSelected(complaint.id);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = statusFilter
    ? complaints.filter(c => c.status === statusFilter)
    : complaints;

  const stats = {
    total:    complaints.length,
    open:     complaints.filter(c => c.status === 'OPEN').length,
    progress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
  };

  const selectedComplaint = selected ? complaints.find(c => c.id === selected) : null;

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#a5b4fc" />
          </div>
          <div>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Faculty Panel</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>Manage and update all student complaints</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',      value: stats.total,    color: '#818cf8' },
            { label: 'Open',       value: stats.open,     color: '#fbbf24' },
            { label: 'Progress',   value: stats.progress, color: '#60a5fa' },
            { label: 'Resolved',   value: stats.resolved, color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
          <button onClick={fetchComplaints} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
            color: '#c7d2fe', fontSize: 12, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filter bar */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: '12px 18px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <Filter size={14} color="var(--gray-400)" />
        <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginRight: 4 }}>Status:</span>
        {FILTER_STATUSES.map(s => {
          const meta = s ? STATUS_META[s] : null;
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: statusFilter === s ? '1.5px solid var(--blue-500)' : '1.5px solid var(--gray-200)',
              background: statusFilter === s ? 'var(--blue-50)' : '#fff',
              color: statusFilter === s ? 'var(--blue-600)' : 'var(--gray-600)',
            }}>
              {s ? (meta?.label || s) : 'All'}
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gray-400)' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--blue-200)', borderTopColor: 'var(--blue-600)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            Loading complaints…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 13 }}>No complaints found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                  {['#ID', 'Student', 'Complaint', 'Category', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: 'var(--gray-500)',
                      textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const sm = STATUS_META[c.status] || STATUS_META.OPEN;
                  const cm = CATEGORY_META[c.category] || { label: c.category, icon: '📝' };
                  const isUpdating = updating === c.id;
                  return (
                    <tr key={c.id} style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none',
                      background: selected === c.id ? '#f0f7ff' : '#fff',
                      transition: 'background .15s',
                    }}>
                      <td style={{ padding: '12px 14px', color: 'var(--gray-400)', fontSize: 12, fontFamily: 'monospace' }}>
                        #{c.id}
                      </td>

                      {/* Student info */}
                      <td style={{ padding: '12px 14px', minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 11, fontWeight: 700,
                          }}>
                            {c.raisedByName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: 13 }}>{c.raisedByName}</div>
                            <div style={{ color: 'var(--gray-400)', fontSize: 11 }}>{c.raisedBy}</div>
                          </div>
                        </div>
                      </td>

                      {/* Complaint title */}
                      <td style={{ padding: '12px 14px', maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 13, marginBottom: 2 }}>
                          {c.title?.length > 45 ? c.title.slice(0, 45) + '…' : c.title}
                        </div>
                        {c.description && (
                          <div style={{ fontSize: 11.5, color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                            {c.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 14 }}>{cm.icon}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--gray-600)', marginLeft: 5 }}>{cm.label}</span>
                      </td>

                      {/* Current status badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                          background: sm.bg, color: sm.color, whiteSpace: 'nowrap',
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot }} />
                          {sm.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 14px', color: 'var(--gray-400)', fontSize: 11.5, whiteSpace: 'nowrap' }}>
                        {timeAgo(c.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Status change dropdown */}
                          <select
                            value={c.status}
                            disabled={isUpdating}
                            onChange={e => handleStatusChange(c, e.target.value)}
                            style={{
                              fontSize: 11.5, padding: '5px 8px', borderRadius: 6,
                              border: '1.5px solid var(--gray-200)', background: '#fff',
                              color: 'var(--gray-700)', cursor: isUpdating ? 'not-allowed' : 'pointer',
                              outline: 'none', fontFamily: 'var(--font-body)',
                              opacity: isUpdating ? 0.6 : 1,
                            }}
                          >
                            {STATUS_TRANSITIONS.map(s => (
                              <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                            ))}
                          </select>

                          {/* View detail */}
                          <button
                            onClick={() => setSelected(selected === c.id ? null : c.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 6,
                              border: selected === c.id ? '1.5px solid var(--blue-400)' : '1.5px solid var(--gray-200)',
                              background: selected === c.id ? 'var(--blue-50)' : '#fff',
                              color: selected === c.id ? 'var(--blue-600)' : 'var(--gray-600)',
                              fontSize: 12, cursor: 'pointer', fontWeight: 500,
                            }}
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedComplaint && (() => {
        const c = selectedComplaint;
        const sm = STATUS_META[c.status] || STATUS_META.OPEN;
        const cm = CATEGORY_META[c.category] || { label: c.category, icon: '📝' };
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }} onClick={() => setSelected(null)}>
            <div style={{
              background: '#fff', borderRadius: 16, padding: 28,
              maxWidth: 540, width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,.25)',
              animation: 'fadeIn .2s ease both',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>Complaint #{c.id}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 22, lineHeight: 1 }}>×</button>
              </div>

              {/* Student info */}
              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Submitted By</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                  }}>
                    {c.raisedByName?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>{c.raisedByName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>User ID: {c.raisedBy}</div>
                  </div>
                </div>
              </div>

              {/* Title + description */}
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>{c.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.65, marginBottom: 16 }}>{c.description}</p>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: sm.bg, color: sm.color }}>
                  {sm.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                  {cm.icon} {cm.label}
                </span>
              </div>

              {/* Status update in modal */}
              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 10 }}>Update Status:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUS_TRANSITIONS.map(s => {
                    const meta = STATUS_META[s];
                    const isActive = c.status === s;
                    const isUpd = updating === c.id;
                    return (
                      <button key={s} onClick={() => handleStatusChange(c, s)} disabled={isActive || isUpd} style={{
                        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: isActive || isUpd ? 'default' : 'pointer',
                        border: `1.5px solid ${isActive ? meta.color : 'var(--gray-200)'}`,
                        background: isActive ? meta.bg : '#fff',
                        color: isActive ? meta.color : 'var(--gray-500)',
                        opacity: isUpd ? 0.6 : 1,
                        transition: 'all .15s',
                      }}>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 14 }}>
                Created: {formatDateTime(c.createdAt)}
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
