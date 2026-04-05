import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://render-tt-project-backend.onrender.com/api/auth/login';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Attach JWT Bearer token from session on every request
api.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem('cms_session') || 'null');
    if (session?.token) {
      config.headers['Authorization'] = `Bearer ${session.token}`;
    }
  } catch {}
  return config;
}, (error) => Promise.reject(error));

// Unwrap ApiResponse envelope { success, message, data }
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cms_session');
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth endpoints ───────────────────────────────────────────────────────────
// POST /api/auth/login   → { userId, password }
// POST /api/auth/register → { fullName, email, password, userId, role }
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ─── Complaint endpoints ──────────────────────────────────────────────────────
// GET    /api/complaints        → list (faculty=all, student=own)
// POST   /api/complaints        → { title, description, category }
// PUT    /api/complaints/{id}/status?status=IN_PROGRESS  (faculty only)
export const complaintAPI = {
  getAll:       ()              => api.get('/complaints'),
  create:       (data)         => api.post('/complaints', data),
  updateStatus: (id, status)   => api.put(`/complaints/${id}/status`, null, { params: { status } }),
};

export default api;
