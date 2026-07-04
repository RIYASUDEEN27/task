import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

/**
 * AuthProvider wraps the app and provides authentication state + actions.
 * Persists the token and user in localStorage so sessions survive page reloads.
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken]     = useState(() => localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true) // true while we verify the token on mount

  // ─── Verify token is still valid on first load ──────────────────────────────
  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const { data } = await authAPI.me()
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        } catch {
          // Token is expired or invalid — clear local state
          clearAuth()
        }
      }
      setLoading(false)
    }
    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveAuth = useCallback((tokenValue, userData) => {
    localStorage.setItem('access_token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    saveAuth(data.access_token, data.user)
    return data.user
  }, [saveAuth])

  const register = useCallback(async (username, email, password) => {
    const { data } = await authAPI.register({ username, email, password })
    saveAuth(data.access_token, data.user)
    return data.user
  }, [saveAuth])

  const logout = useCallback(async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    clearAuth()
  }, [clearAuth])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook to consume auth context. Must be used inside AuthProvider. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
