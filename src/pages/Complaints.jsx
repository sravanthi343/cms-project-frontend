import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X, Plus, RefreshCw } from 'lucide-react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import { STATUS_META, CATEGORIES } from '../utils/helpers';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500,
      border: active ? '1.5px solid var(--blue-500)' : '1.5px solid var(--gray-200)',
      background: active ? 'var(--blue-50)' : '#fff',
      color: active ? 'var(--blue-600)' : 'var(--gray-600)',
      cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
    }}
  >{label || 'All'}</button>
);

export default function Complaints() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate      = useNavigate();
  const { isFaculty } = useAuth();

  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [category, setCategory]           = useState('');
  const [showFilters, setShowFilters]     = useState(false);

  // ── Status & search live in the URL so Dashboard "?status=OPEN" links work ──
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  // Local input mirrors URL search value
  const [localSearch, setLocalSearch] = useState(search);
  useEffect(() => { setLocalSearch(search); }, [search]);

  const setStatus = (val) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      val ? next.set('status', val) : next.delete('status');
      return next;
    });

  const commitSearch = (val) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      val ? next.set('search', val) : next.delete('search');
      return next;
    });

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await complaintAPI.getAll();
      setAllComplaints(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  // Client-side filter; status and search come from URL
  const filtered = useMemo(() => {
    let result = allComplaints;
    if (status)   result = result.filter(c => c.status === status);
    if (category) result = result.filter(c => c.category === category);
    if (search)   result = result.filter(c =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.raisedByName?.toLowerCase().includes(search.toLowerCase()) ||
      c.raisedBy?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    );
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allComplaints, status, category, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    commitSearch(localSearch.trim());
  };

  const clearAll = () => {
    setCategory('');
    setLocalSearch('');
    setSearchParams({});
  };

  const hasFilters = search || status || category;
  const statusMeta = status ? STATUS_META[status] : null;

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>

      {/* Active status banner — visible when arriving from Dashboard stat cards */}
      {status && statusMeta && (
        <div style={{
          background: statusMeta.bg,
          border: `1px solid ${statusMeta.color}44`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: statusMeta.color }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: statusMeta.dot, marginRight: 7, verticalAlign: 'middle' }} />
            Showing: {statusMeta.label} complaints ({filtered.length})
          </span>
          <button onClick={() => setStatus('')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: statusMeta.color, display: 'flex', alignItems: 'center',
            gap: 4, fontSize: 12, fontWeight: 500,
          }}>
            <X size={12} /> Clear
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: '14px 18px',
        marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, flex: 1, minWidth: 200 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder={isFaculty ? 'Search title, student, category…' : 'Search your complaints…'}
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 10, height: 36,
                border: '1.5px solid var(--gray-200)', borderRadius: 8,
                fontSize: 13, outline: 'none', transition: 'border-color .15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue-400)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
            />
          </div>
          <button type="submit" style={{
            background: 'var(--blue-600)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '0 14px',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>Search</button>
        </form>

        <button
          onClick={() => setShowFilters(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 36,
            border: (showFilters || category) ? '1.5px solid var(--blue-400)' : '1.5px solid var(--gray-200)',
            background: (showFilters || category) ? 'var(--blue-50)' : '#fff',
            color: (showFilters || category) ? 'var(--blue-600)' : 'var(--gray-600)',
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <Filter size={13} /> Filters{category ? ' ●' : ''}
        </button>

        <button onClick={fetchComplaints} disabled={loading} title="Refresh" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, border: '1.5px solid var(--gray-200)',
          background: '#fff', borderRadius: 8,
          color: 'var(--gray-500)', cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        {hasFilters && (
          <button onClick={clearAll} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', height: 36,
            border: '1.5px solid var(--gray-200)', background: '#fff',
            color: 'var(--gray-500)', borderRadius: 8, fontSize: 12.5, cursor: 'pointer',
          }}>
            <X size={12} /> Clear all
          </button>
        )}

        
      </div>

      {/* Category / status filter chips */}
      {showFilters && (
        <div style={{
          background: '#fff', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 16,
          animation: 'fadeIn .2s ease both',
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 7 }}>Status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <Chip key={s} label={s ? (STATUS_META[s]?.label || s) : 'All'} active={status === s} onClick={() => setStatus(s)} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 7 }}>Category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Chip label="All" active={!category} onClick={() => setCategory('')} />
              {CATEGORIES.map(c => (
                <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Count */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
          {loading ? 'Loading…' : `${filtered.length} complaint${filtered.length !== 1 ? 's' : ''}`}
          {!loading && status && ` · ${statusMeta?.label || status}`}
          {!loading && category && ` · ${category}`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: 180, borderRadius: 'var(--radius-md)',
              background: 'var(--gray-100)', animation: 'pulse 2s infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)', padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>No complaints found</h3>
          <p style={{ fontSize: 13.5, color: 'var(--gray-400)', marginBottom: 20 }}>
            {hasFilters ? 'Try adjusting your filters.' : 'No complaints yet.'}
          </p>
          {!hasFilters && (
            <button onClick={() => navigate('/add')} style={{
              padding: '9px 20px', background: 'var(--blue-600)', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>+ New Complaint</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.5; } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
