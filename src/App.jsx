import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar      from './components/Sidebar';
import Navbar       from './components/Navbar';
import Footer       from './components/Footer';
import Dashboard    from './pages/Dashboard';
import Complaints   from './pages/Complaints';
import AddComplaint from './pages/AddComplaint';
import Urgent       from './pages/Urgent';
import Profile      from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminPanel   from './pages/AdminPanel';
import Login        from './pages/Login';
import NotFound     from './pages/NotFound';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <main
        style={{
          marginLeft: 'var(--sidebar-w)',
          marginTop: 'var(--navbar-h)',
          padding: '28px 28px 0',
          minHeight: 'calc(100vh - var(--navbar-h))',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}
        className="main-content"
      >
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </main>
      <style>{`@media(max-width:768px){.main-content{margin-left:0!important;padding:20px 16px 0!important}}`}</style>
    </>
  );
}

function ProtectedRoute({ children, facultyOnly = false }) {
  const { user, loading, isFaculty } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid var(--blue-200)', borderTopColor: 'var(--blue-600)',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Loading…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (facultyOnly && !isFaculty) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/complaints" element={
        <ProtectedRoute><Layout><Complaints /></Layout></ProtectedRoute>
      } />
      <Route path="/add" element={
        <ProtectedRoute><Layout><AddComplaint /></Layout></ProtectedRoute>
      } />
      <Route path="/urgent" element={
        <ProtectedRoute><Layout><Urgent /></Layout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>
      } />
      {/* Faculty-only route */}
      <Route path="/admin" element={
        <ProtectedRoute facultyOnly><Layout><AdminPanel /></Layout></ProtectedRoute>
      } />

      <Route path="*" element={<Layout><NotFound /></Layout>} />

      
    </Routes>

    
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Sora, sans-serif', fontSize: 13.5 },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
