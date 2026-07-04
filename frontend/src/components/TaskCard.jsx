import { useState } from 'react'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)

const CalIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="11" height="11" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/**
 * TaskCard — displays a single task with toggle, edit, and delete actions.
 *
 * Props:
 *   task     — task object from API
 *   onToggle — (id) => void
 *   onEdit   — (task) => void  (opens modal with task pre-filled)
 *   onDelete — (id) => void
 */
export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date()

  const formatDate = (iso) => {
    if (!iso) return null
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(task.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <article className={`task-card ${task.completed ? 'completed' : ''}`} aria-label={`Task: ${task.title}`}>
      {/* Header row: checkbox + title */}
      <div className="task-card-header">
        {/* Custom circular checkbox */}
        <button
          id={`task-toggle-${task.id}`}
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          aria-pressed={task.completed}
        >
          {task.completed && <CheckIcon />}
        </button>

        <div className="task-title-wrap">
          <p className="task-title">{task.title}</p>
          {task.description && (
            <p className="task-desc" style={{ marginTop: '4px' }}>{task.description}</p>
          )}
        </div>
      </div>

      {/* Meta: priority badge + due date */}
      <div className="task-meta">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>

        {task.due_date && (
          <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
            <CalIcon />
            {isOverdue ? '⚠ ' : ''}{formatDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="task-actions">
        <button
          id={`task-edit-${task.id}`}
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          style={{ flex: 1 }}
        >
          <EditIcon />
          Edit
        </button>

        <button
          id={`task-delete-${task.id}`}
          className="btn btn-danger btn-sm btn-icon"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete task"
        >
          {deleting ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <TrashIcon />}
        </button>
      </div>
    </article>
  )
}
