import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle,
  TrendingUp, ArrowRight,
} from 'lucide-react';
import { complaintAPI } from '../services/api';
import { CATEGORY_META, STATUS_META } from '../utils/helpers';
import ComplaintCard from '../components/ComplaintCard';

const StatCard = ({ label, value, icon: Icon, color, bg, sub, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff', border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-md)', padding: '20px 22px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all var(--transition)',
      position: 'relative', overflow: 'hidden',
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-md)', e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'none', e.currentTarget.style.transform = 'translateY(0)')}
  >
    <div style={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      borderRadius: '50%', background: bg, opacity: .5,
    }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} strokeWidth={2.2} />
      </div>
    </div>
    <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 6 }}>{sub}</div>}
  </div>
);

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6b7280', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#a3e635'];

export default function Dashboard() {
  const navigate      = useNavigate();
  const { user, isFaculty } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // GET /api/complaints — faculty gets all, student gets own
        const res = await complaintAPI.getAll();
        setComplaints(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute stats from the complaint list
  const stats = {
    total:      complaints.length,
    open:       complaints.filter(c => c.status === 'OPEN').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved:   complaints.filter(c => c.status === 'RESOLVED').length,
    closed:     complaints.filter(c => c.status === 'CLOSED').length,
  };

  // Group by category for bar chart
  const categoryCount = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // Group by status for pie chart
  const statusCount = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCount).map(([name, value]) => ({
    name: STATUS_META[name]?.label || name,
    value,
  }));

  const recent = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const statusCards = [
    { label: 'Total',       value: stats.total,      icon: ClipboardList, color: '#2563eb', bg: '#eff6ff', sub: isFaculty ? 'All complaints' : 'Your complaints' },
    { label: 'Open',        value: stats.open,       icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', sub: 'Awaiting action',   filter: 'OPEN' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock,         color: '#7c3aed', bg: '#f5f3ff', sub: 'Being worked on',   filter: 'IN_PROGRESS' },
    { label: 'Resolved',    value: stats.resolved,   icon: CheckCircle,   color: '#059669', bg: '#ecfdf5', sub: 'Successfully closed', filter: 'RESOLVED' },
  ];

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
  const name     = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blue-700) 0%, var(--blue-900) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
            Good {greeting}, {name} 👋
          </div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px' }}>
            {isFaculty ? "Here's what's happening today" : 'Track your complaints'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>
            {stats.open > 0
              ? `${stats.open} open complaint${stats.open > 1 ? 's' : ''} need${stats.open === 1 ? 's' : ''} attention`
              : 'All caught up! No open complaints.'}
          </p>
        </div>
        
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {statusCards.map((c) => (
          <StatCard
            key={c.label}
            {...c}
            onClick={c.filter ? () => navigate(`/complaints?status=${c.filter}`) : undefined}
          />
        ))}
      </div>

      {/* Charts */}
      {complaints.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="chart-grid">
          {/* Category bar chart */}
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>By Category</h3>
              <TrendingUp size={14} color="var(--gray-400)" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie chart */}
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>By Status</h3>
              <ClipboardList size={14} color="var(--gray-400)" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={36}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent complaints */}
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>Recent Complaints</h3>
          <button
            onClick={() => navigate('/complaints')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none',
              color: 'var(--blue-600)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
            View all <ArrowRight size={13} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: 160, borderRadius: 'var(--radius-md)',
                background: 'var(--gray-100)', animation: 'pulse 2s infinite',
              }} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 13 }}>No complaints yet. Submit your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {recent.map(c => <ComplaintCard key={c.id} complaint={c} />)}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .chart-grid { grid-template-columns: 1fr !important; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
}
