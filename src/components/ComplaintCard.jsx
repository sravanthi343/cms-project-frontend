import { Clock, User, Tag, ChevronRight } from 'lucide-react';
import { STATUS_META, CATEGORY_META, timeAgo, truncate } from '../utils/helpers';

// Backend Complaint shape:
// { id, title, description, category, status, createdAt, raisedBy (userId), raisedByName }
// No "priority" or "email" fields in backend.

export default function ComplaintCard({ complaint, compact = false }) {
  const sm = STATUS_META[complaint.status]    || STATUS_META.OPEN;
  const cm = CATEGORY_META[complaint.category] || { label: complaint.category, icon: '📝' };

  return (
    <article
      style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: compact ? '14px 16px' : '18px 20px',
        cursor: 'default', transition: 'all var(--transition)',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--blue-300)';
        e.currentTarget.style.boxShadow   = 'var(--shadow-md)';
        e.currentTarget.style.transform   = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--gray-200)';
        e.currentTarget.style.boxShadow   = 'none';
        e.currentTarget.style.transform   = 'translateY(0)';
      }}
    >
      {/* Status stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: sm.color, borderRadius: '10px 0 0 10px',
      }} />

      <div style={{ marginLeft: 8 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{cm.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>
                #{complaint.id} · {cm.label}
              </span>
            </div>
            <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--gray-900)', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
              {truncate(complaint.title, 70)}
            </h3>
          </div>
          <ChevronRight size={14} color="var(--gray-300)" style={{ flexShrink: 0, marginTop: 4 }} />
        </div>

        {/* Description */}
        {complaint.description && !compact && (
          <p style={{ fontSize: 12.5, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 12 }}>
            {truncate(complaint.description, 100)}
          </p>
        )}

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
            background: sm.bg, color: sm.color,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot }} />
            {sm.label}
          </span>
          <span style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 99,
            background: 'var(--gray-100)', color: 'var(--gray-500)', fontWeight: 500,
          }}>
            <Tag size={9} style={{ marginRight: 3, verticalAlign: 'middle' }} />
            {complaint.category}
          </span>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 10, borderTop: '1px solid var(--gray-100)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)', fontSize: 11.5 }}>
            <User size={11} />
            <span style={{ fontWeight: 500 }}>
              {complaint.raisedByName || complaint.raisedBy}
            </span>
            <span style={{ color: 'var(--gray-300)', margin: '0 2px' }}>·</span>
            <span style={{ color: 'var(--gray-400)', fontSize: 11 }}>{complaint.raisedBy}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-400)', fontSize: 11.5 }}>
            <Clock size={11} />
            <span>{timeAgo(complaint.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
