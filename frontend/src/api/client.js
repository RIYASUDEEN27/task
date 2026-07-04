import axios from 'axios'

// Use the Vite proxy in development (/api → localhost:8000)
// In production set VITE_API_URL to your backend host
const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ─── Request Interceptor: attach JWT ──────────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response Interceptor: normalize errors ────────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returned a 401, clear local token so the user is redirected
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // Let callers handle the redirect via React Router
    }
    return Promise.reject(error)
  },
)

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => client.post('/api/auth/register', data),
  login:    (data) => client.post('/api/auth/login', data),
  logout:   ()     => client.post('/api/auth/logout'),
  me:       ()     => client.get('/api/auth/me'),
}

// ─── Tasks API ────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll:  ()           => client.get('/api/tasks/'),
  create:  (data)       => client.post('/api/tasks/', data),
  update:  (id, data)   => client.put(`/api/tasks/${id}`, data),
  toggle:  (id)         => client.patch(`/api/tasks/${id}/toggle`),
  delete:  (id)         => client.delete(`/api/tasks/${id}`),
}

export default client
