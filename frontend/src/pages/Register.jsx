import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const MailIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm]           = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors]       = useState({})
  const [apiError, setApiError]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.username)                        errs.username = 'Username is required'
    else if (form.username.length < 3)         errs.username = 'At least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Only letters, numbers, and underscores'

    if (!form.email)                               errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))     errs.email = 'Enter a valid email'

    if (!form.password)                        errs.password = 'Password is required'
    else if (form.password.length < 6)         errs.password = 'At least 6 characters'

    if (!form.confirmPassword)                 errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'

    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8)       score++
    if (/[A-Z]/.test(pw))     score++
    if (/[0-9]/.test(pw))     score++
    if (/[^a-zA-Z0-9]/.test(pw)) score++
    if (score <= 1) return { level: score, label: 'Weak',   color: 'var(--color-danger)' }
    if (score === 2) return { level: score, label: 'Fair',   color: 'var(--color-warning)' }
    if (score === 3) return { level: score, label: 'Good',   color: 'var(--priority-low)' }
    return              { level: score, label: 'Strong', color: 'var(--color-success)' }
  }

  const strength = getPasswordStrength(form.password)

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="auth-logo-text text-gradient">TaskFlow</span>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join TaskFlow and start managing your tasks</p>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {apiError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate id="register-form">
            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-username">Username</label>
              <div className="input-group">
                <span className="input-group-icon"><UserIcon /></span>
                <input
                  id="register-username"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email address</label>
              <div className="input-group">
                <span className="input-group-icon"><MailIcon /></span>
                <input
                  id="register-email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div className="password-wrap">
                <div className="input-group">
                  <span className="input-group-icon"><LockIcon /></span>
                  <input
                    id="register-password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    style={{ paddingRight: '44px' }}
                  />
                </div>
                <button type="button" className="password-toggle" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Password strength bar */}
              {form.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(strength.level / 4) * 100}%`,
                      height: '100%',
                      background: strength.color,
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600, minWidth: 40 }}>
                    {strength.label}
                  </span>
                </div>
              )}
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">Confirm password</label>
              <div className="password-wrap">
                <div className="input-group">
                  <span className="input-group-icon"><LockIcon /></span>
                  <input
                    id="register-confirm"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    style={{ paddingRight: '44px' }}
                  />
                </div>
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: '8px', padding: '14px' }}
            >
              {loading ? <><div className="spinner" />Creating account…</> : 'Create account'}
            </button>
          </form>

          <p className="auth-divider">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
