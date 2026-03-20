import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, ChevronRight } from 'lucide-react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { addNotification } from '../context/AuthContext';
import { CATEGORIES, CATEGORY_META } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AddComplaint() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [form, setForm]       = useState({ title: '', description: '', category: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '', _global: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 5)                e.title       = 'Min 5 characters required';
    if (!form.description.trim() || form.description.length < 10)   e.description = 'Min 10 characters required';
    if (!form.category)                                              e.category    = 'Please select a category';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await complaintAPI.create({
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
      });
      if (user) {
        addNotification(user.userId, {
          type: 'new_complaint',
          title: 'Complaint submitted',
          message: `"${form.title}" is now under review.`,
        });
      }
      setSuccess(true);
      toast.success('Complaint submitted successfully!');
      setTimeout(() => navigate('/complaints'), 2000);
    } catch (err) {
      setErrors({ _global: err.message || 'Failed to submit. Please try again.' });
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 420, animation: 'fadeIn .35s ease both',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
      }}>
        <CheckCircle size={34} color="#10b981" />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>Complaint Submitted</h2>
      <p style={{ fontSize: 13.5, color: 'var(--gray-500)', marginBottom: 4, textAlign: 'center' }}>
        Your complaint has been received and linked to your account.
      </p>
      <p style={{ fontSize: 12.5, color: 'var(--gray-400)' }}>Redirecting to complaints list…</p>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );

  const selectedCategoryMeta = form.category ? CATEGORY_META[form.category] : null;
  const descLen = form.description.length;

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860, animation: 'fadeIn .35s ease both' }}>

      {/* Page title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'var(--gray-400)' }}>
        <span style={{ cursor: 'pointer', color: 'var(--blue-600)', fontWeight: 500 }} onClick={() => navigate('/complaints')}>Complaints</span>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--gray-600)', fontWeight: 500 }}>New Complaint</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }} className="complaint-layout">

        {/* ── Left: Form ── */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid var(--gray-100)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--blue-600), var(--blue-800))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 16 }}>📝</span>
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.2px' }}>
                Submit a Complaint
              </h2>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>
                Filed by <strong style={{ color: 'var(--gray-600)' }}>{user?.fullName}</strong> · {user?.userId}
              </p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>

            {errors._global && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '10px 14px', marginBottom: 18,
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: 13, color: '#dc2626' }}>{errors._global}</span>
              </div>
            )}

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>
                Complaint Title <Req />
              </label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. WiFi not working in Lab 3"
                maxLength={120}
                style={inp(errors.title)}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = errors.title ? '#ef4444' : '#e4e4e7'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.title
                  ? <Err msg={errors.title} />
                  : <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Be specific and concise</span>}
                <span style={{ fontSize: 11, color: form.title.length > 100 ? '#f59e0b' : 'var(--gray-300)' }}>
                  {form.title.length}/120
                </span>
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Category <Req /></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const meta    = CATEGORY_META[cat] || { icon: '📝', label: cat };
                  const isActive = form.category === cat;
                  return (
                    <button
                      key={cat} type="button"
                      onClick={() => set('category', cat)}
                      style={{
                        padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                        border: `1.5px solid ${isActive ? 'var(--blue-500)' : (errors.category ? '#fecaca' : '#e4e4e7')}`,
                        background: isActive ? 'var(--blue-50)' : '#fff',
                        display: 'flex', alignItems: 'center', gap: 7,
                        transition: 'all .15s', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 15, lineHeight: 1 }}>{meta.icon}</span>
                      <span style={{
                        fontSize: 12, fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--blue-700)' : 'var(--gray-600)',
                        lineHeight: 1.2,
                      }}>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category && <Err msg={errors.category} />}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>Description <Req /></label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the issue in detail — include location, time, and any relevant context…"
                rows={5}
                maxLength={2000}
                style={{ ...inp(errors.description), resize: 'vertical', lineHeight: 1.65, minHeight: 110 }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = errors.description ? '#ef4444' : '#e4e4e7'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.description
                  ? <Err msg={errors.description} />
                  : <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Min 10 characters</span>}
                <span style={{ fontSize: 11, color: descLen > 1800 ? '#ef4444' : descLen > 1500 ? '#f59e0b' : 'var(--gray-300)' }}>
                  {descLen}/2000
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--gray-100)', paddingTop: 18 }}>
              <button
                type="button" onClick={() => navigate(-1)}
                style={{
                  padding: '10px 20px', border: '1.5px solid var(--gray-200)',
                  borderRadius: 8, background: '#fff', color: 'var(--gray-600)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                style={{
                  flex: 1, padding: '11px',
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 13.5, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: loading ? 'none' : '0 3px 14px rgba(37,99,235,.3)',
                  transition: 'all .2s',
                }}
              >
                {loading
                  ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                  : 'Submit Complaint →'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: Info panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Submitted as */}
          <div style={{
            background: '#fff', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)', padding: '16px 18px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
              Submitted As
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,var(--blue-500),var(--blue-700))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
              }}>
                {user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>{user?.fullName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>{user?.userId} · {user?.role}</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--gray-500)', lineHeight: 1.5 }}>
              Your name and ID will be visible to faculty when reviewing this complaint.
            </div>
          </div>

          {/* Preview */}
          {(form.title || form.category) && (
            <div style={{
              background: '#fff', border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)', padding: '16px 18px',
              animation: 'fadeIn .2s ease',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
                Preview
              </div>
              {form.category && selectedCategoryMeta && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 15 }}>{selectedCategoryMeta.icon}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    background: 'var(--blue-50)', color: 'var(--blue-600)',
                  }}>{selectedCategoryMeta.label}</span>
                </div>
              )}
              {form.title && (
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--gray-900)', lineHeight: 1.4, marginBottom: 6 }}>
                  {form.title}
                </div>
              )}
              {form.description && (
                <div style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {form.description}
                </div>
              )}
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#eff6ff', color: '#2563eb' }}>
                  ● Open
                </span>
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{
            background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)', padding: '16px 18px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
              Tips
            </div>
            {[
              'Be specific about the location and time',
              'Include any previous attempts to resolve',
              'Attach relevant context in the description',
              'You will be notified on status changes',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--blue-400)', fontSize: 12, marginTop: 1, flexShrink: 0 }}>›</span>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @media(max-width:700px) { .complaint-layout{grid-template-columns:1fr !important} }
      `}</style>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────
const Req = () => <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;

const Err = ({ msg }) => (
  <span style={{ fontSize: 11.5, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}>
    <AlertCircle size={11} />{msg}
  </span>
);

const lbl = {
  display: 'block', fontSize: 12.5, fontWeight: 600,
  color: 'var(--gray-700)', marginBottom: 7,
};

const inp = (err) => ({
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  border: `1.5px solid ${err ? '#ef4444' : '#e4e4e7'}`,
  borderRadius: 8, fontSize: 13.5, outline: 'none',
  background: '#fff', color: 'var(--gray-900)',
  transition: 'border-color .15s', fontFamily: 'var(--font-body)',
});
