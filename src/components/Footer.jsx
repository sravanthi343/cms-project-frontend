export default function Footer() {
  return (
    <footer style={{
      marginTop: 32,
      marginLeft: -28,   /* cancel the 28px padding of <main> so footer spans full width */
      marginRight: -28,
      padding: '14px 28px',
      borderTop: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      fontSize: 12,
      color: 'var(--gray-400)',
      flexWrap: 'wrap',
      gap: 8,
    }}>
      <span>© {new Date().getFullYear()} Complaint Management System</span>
      <span>A system to register and track complaints efficiently.</span>
    </footer>
  );
}
