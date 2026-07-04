import { useState, useEffect } from 'react'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const XIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PRIORITY_OPTIONS = [
  { value: 'low',    label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🔴 High' },
]

const EMPTY = { title: '', description: '', priority: 'medium', due_date: '' }

/**
 * TaskModal — create or edit a task.
 *
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   onSubmit  — (formData) => Promise<void>
 *   task      — task object to pre-fill when editing (null for create)
 */
export default function TaskModal({ isOpen, onClose, onSubmit, task }) {
  const isEditing = Boolean(task)

  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // Pre-fill form when editing an existing task
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        priority:    task.priority    || 'medium',
        // Convert ISO date to YYYY-MM-DD for the date input
        due_date:    task.due_date
          ? new Date(task.due_date).toISOString().split('T')[0]
          : '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
    setApiError('')
  }, [task, isOpen])

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    else if (form.title.length > 200) errs.title = 'Max 200 characters'
    if (form.description && form.description.length > 1000) errs.description = 'Max 1000 characters'
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
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        priority:    form.priority,
        due_date:    form.due_date ? new Date(form.due_date).toISOString() : null,
      }
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            id="modal-close-btn"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon />
          </button>
        </div>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate id="task-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                className={`form-input ${errors.title ? 'error' : ''}`}
                type="text"
                name="title"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={handleChange}
                autoFocus
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
                name="description"
                placeholder="Add more details… (optional)"
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Priority + Due Date row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="form-input form-select"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-due-date">Due date</label>
                <input
                  id="task-due-date"
                  className="form-input"
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} id="modal-cancel-btn">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading} id="modal-submit-btn">
                {loading
                  ? <><div className="spinner" />{isEditing ? 'Saving…' : 'Creating…'}</>
                  : isEditing ? 'Save changes' : 'Create task'
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
