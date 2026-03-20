import { useEffect } from 'react';
import { Bell, CheckCheck, Info, ClipboardList, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';

const ICON_MAP = {
  welcome:       <Star size={15} color="#f59e0b" />,
  new_complaint: <ClipboardList size={15} color="#3b82f6" />,
  status_update: <Info size={15} color="#8b5cf6" />,
  default:       <Bell size={15} color="#6b7280" />,
};

export default function Notifications() {
  const { notifications, markAllRead, unreadCount, refreshNotifications } = useAuth();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return (
    <div style={{ maxWidth: 680, animation: 'fadeIn .35s ease both' }}>
      {/* Header */}
      <div style={{
        background: '#fff', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: '18px 22px',
        marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={18} color="var(--blue-600)" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>Notifications</h2>
          {unreadCount > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
            }}>{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8,
              border: '1.5px solid var(--gray-200)', background: '#fff',
              color: 'var(--gray-600)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md)', padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>
            No notifications yet
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--gray-400)' }}>
            You'll be notified about complaint updates here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              background: n.read ? '#fff' : '#f0f7ff',
              border: `1px solid ${n.read ? 'var(--gray-200)' : 'var(--blue-200)'}`,
              borderRadius: 'var(--radius-md)', padding: '14px 18px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
              transition: 'all .15s',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: n.read ? 'var(--gray-100)' : '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ICON_MAP[n.type] || ICON_MAP.default}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 13.5, fontWeight: n.read ? 500 : 700, color: 'var(--gray-900)' }}>
                    {n.title}
                  </span>
                  {!n.read && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 4 }}>
                  {n.message}
                </p>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                  {timeAgo(n.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
