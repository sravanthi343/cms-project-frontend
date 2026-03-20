import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh',
      animation: 'fadeIn .35s ease both', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 80, fontWeight: 800, color: 'var(--gray-200)',
        fontFamily: 'var(--font-mono)', letterSpacing: '-4px', lineHeight: 1,
        marginBottom: 8,
      }}>404</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>
        Page not found
      </h2>
      <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 28, maxWidth: 340 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => navigate(-1)} style={{
          padding: '10px 20px', borderRadius: 9,
          border: '1.5px solid var(--gray-200)', background: '#fff',
          color: 'var(--gray-600)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
        }}>Go Back</button>
        <button onClick={() => navigate('/')} style={{
          padding: '10px 20px', borderRadius: 9,
          background: 'var(--blue-600)', border: 'none',
          color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
        }}>Dashboard</button>
      </div>
    </div>
  );
}
