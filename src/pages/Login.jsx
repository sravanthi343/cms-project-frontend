import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['STUDENT', 'FACULTY'];

export default function Login() {
  const navigate     = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode]   = useState('login'); // 'login' | 'register'
  const [form, setForm]   = useState({
    userId: '', password: '', confirm: '',
    fullName: '', email: '', role: 'STUDENT',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '', _global: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.userId.trim())                                   e.userId   = 'User ID is required';
    if (form.password.length < 6)                              e.password = 'Password must be at least 6 characters';
    if (mode === 'register') {
      if (!form.fullName.trim())                               e.fullName = 'Full name is required';
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))   e.email    = 'Enter a valid email address';
      if (form.password !== form.confirm)                      e.confirm  = 'Passwords do not match';
      if (!ROLES.includes(form.role))                          e.role     = 'Please select a role';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.userId.trim(), form.password);
        toast.success('Welcome back!');
      } else {
        await register({
          userId:   form.userId.trim(),
          fullName: form.fullName.trim(),
          email:    form.email.trim(),
          password: form.password,
          role:     form.role,
        });
        toast.success('Account created! Welcome to CMS');
      }
      navigate('/');
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setForm({ userId: '', password: '', confirm: '', fullName: '', email: '', role: 'STUDENT' });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 40%, #1a3260 100%)',
      fontFamily: 'var(--font-body)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(37,99,235,.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(37,99,235,.06)', pointerEvents: 'none' }} />

      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', maxWidth: 560,
      }} className="login-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.5px',
            boxShadow: '0 4px 20px rgba(59,130,246,.4)',
          }}>AU</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>CMS Platform</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 11 }}>College Complaint Management</div>
          </div>
        </div>

        <h1 style={{ color: '#fff', fontSize: 38, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 18 }}>
          Manage complaints<br />
          <span style={{ color: '#60a5fa' }}>with clarity.</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}>
          A unified platform to track, manage, and resolve college complaints efficiently. Every voice matters.
        </p>

        {[
          { icon: '🔐', text: 'Secure JWT-based authentication' },
          { icon: '📊', text: 'Real-time dashboard for students & faculty' },
          { icon: '🔔', text: 'Status update notifications' },
          { icon: '👤', text: 'Faculty panel to manage all complaints' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 13.5 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 60px',
      }}>
        <div style={{
          background: 'rgba(255,255,255,.97)',
          borderRadius: 20, padding: '40px 44px',
          width: '100%', maxWidth: 460,
          boxShadow: '0 24px 80px rgba(0,0,0,.35)',
          animation: 'fadeIn .45s ease both',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: '#f4f4f5', borderRadius: 10,
            padding: 4, marginBottom: 32,
          }}>
            {[['login', 'Sign In'], ['register', 'Register']].map(([m, label]) => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: '9px 0', borderRadius: 7,
                background: mode === m ? '#fff' : 'transparent',
                border: 'none', fontSize: 13.5, fontWeight: 600,
                color: mode === m ? 'var(--gray-900)' : 'var(--gray-500)',
                cursor: 'pointer',
                boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,.12)' : 'none',
                transition: 'all .2s',
              }}>{label}</button>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, letterSpacing: '-0.4px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>
            {mode === 'login' ? 'Sign in with your college User ID' : 'Register with your college credentials'}
          </p>

          

          {errors._global && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 12px', marginBottom: 20,
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <AlertCircle size={14} color="#ef4444" />
              <span style={{ fontSize: 13, color: '#dc2626' }}>{errors._global}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Register-only fields */}
            {mode === 'register' && (
              <>
                <Field label="Full Name" error={errors.fullName}>
                  <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    placeholder="Enter Your FullName" style={inputStyle(errors.fullName)}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = errors.fullName ? '#ef4444' : '#e4e4e7'}
                  />
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="your@gamil.com" style={inputStyle(errors.email)}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e4e4e7'}
                  />
                </Field>
              </>
            )}

            <Field label="User ID" error={errors.userId}>
              <input value={form.userId} onChange={e => set('userId', e.target.value)}
                placeholder={mode === 'login' ? 'STU001 or FAC001' : 'e.g. STU002'}
                style={inputStyle(errors.userId)}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = errors.userId ? '#ef4444' : '#e4e4e7'}
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{ ...inputStyle(errors.password), paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e4e4e7'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: 0,
                }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {mode === 'register' && (
              <>
                <Field label="Confirm Password" error={errors.confirm}>
                  <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)}
                    placeholder="Repeat your password" style={inputStyle(errors.confirm)}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = errors.confirm ? '#ef4444' : '#e4e4e7'}
                  />
                </Field>

                <Field label="Role" error={errors.role}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {ROLES.map(r => (
                      <button key={r} type="button" onClick={() => set('role', r)} style={{
                        flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all .15s',
                        border: `1.5px solid ${form.role === r ? '#2563eb' : '#e4e4e7'}`,
                        background: form.role === r ? '#eff6ff' : '#fff',
                        color: form.role === r ? '#1d4ed8' : 'var(--gray-500)',
                      }}>
                        {r === 'STUDENT' ? '🎓 Student' : '👨‍🏫 Faculty'}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', marginTop: 8,
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,.35)',
              transition: 'all .2s',
            }}>
              {loading
                ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                : mode === 'login' ? '→ Sign In' : '→ Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--gray-400)', marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} style={{
              background: 'none', border: 'none', color: '#2563eb', fontWeight: 600,
              cursor: 'pointer', fontSize: 12.5, padding: 0,
            }}>
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .login-left { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>{label}</label>
    {children}
    {error && (
      <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <AlertCircle size={11} />{error}
      </p>
    )}
  </div>
);

const inputStyle = (err) => ({
  width: '100%', padding: '11px 12px', boxSizing: 'border-box',
  border: `1.5px solid ${err ? '#ef4444' : '#e4e4e7'}`,
  borderRadius: 8, fontSize: 13.5, outline: 'none',
  background: '#fff', color: 'var(--gray-900)',
  transition: 'border-color .15s', fontFamily: 'var(--font-body)',
});
