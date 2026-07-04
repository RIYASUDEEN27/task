import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { tasksAPI } from '../api/client'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const FILTERS = ['all', 'active', 'completed']

export default function Dashboard() {
  const { user } = useAuth()

  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [filter, setFilter]       = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask]   = useState(null) // null = create mode

  // ─── Fetch Tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await tasksAPI.getAll()
      setTasks(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ─── Task Actions ─────────────────────────────────────────────────────────────
  const handleCreate = async (payload) => {
    const { data } = await tasksAPI.create(payload)
    setTasks(prev => [data, ...prev])
  }

  const handleUpdate = async (payload) => {
    const { data } = await tasksAPI.update(editTask.id, payload)
    setTasks(prev => prev.map(t => t.id === data.id ? data : t))
  }

  const handleToggle = async (id) => {
    try {
      const { data } = await tasksAPI.toggle(id)
      setTasks(prev => prev.map(t => t.id === data.id ? data : t))
    } catch { /* ignore */ }
  }

  const handleDelete = async (id) => {
    await tasksAPI.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const openCreate = () => { setEditTask(null); setModalOpen(true) }
  const openEdit   = (task) => { setEditTask(task); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTask(null) }

  // ─── Filtered Tasks ───────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    if (filter === 'active')    return !t.completed
    if (filter === 'completed') return  t.completed
    return true
  })

  // ─── Stats ────────────────────────────────────────────────────────────────────
  const total     = tasks.length
  const done      = tasks.filter(t => t.completed).length
  const active    = total - done
  const highPri   = tasks.filter(t => t.priority === 'high' && !t.completed).length

  // Hour-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        {/* ─── Dashboard Header ─────────────────────────────────────────── */}
        <header className="dashboard-header">
          <h1 className="dashboard-greeting">
            {greeting}, <span className="text-gradient">{user?.username}</span> 👋
          </h1>
          <p className="dashboard-subtitle">
            {active === 0
              ? 'All caught up! Great work today.'
              : `You have ${active} active task${active !== 1 ? 's' : ''} to complete.`}
          </p>
        </header>

        {/* ─── Stats Cards ──────────────────────────────────────────────── */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--color-text-accent)' }}>{active}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--color-success)' }}>{done}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: 'var(--color-danger)' }}>{highPri}</span>
            <span className="stat-label">High priority</span>
          </div>
        </div>

        {/* ─── Task Controls ─────────────────────────────────────────────── */}
        <div className="task-controls">
          {/* Filter tabs */}
          <div className="filter-tabs" role="tablist" aria-label="Task filter">
            {FILTERS.map(f => (
              <button
                key={f}
                id={`filter-${f}`}
                role="tab"
                aria-selected={filter === f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* New Task button — pushed to the right */}
          <button
            id="new-task-btn"
            className="btn btn-primary"
            onClick={openCreate}
            style={{ marginLeft: 'auto' }}
          >
            <PlusIcon />
            New Task
          </button>
        </div>

        {/* ─── Error Banner ─────────────────────────────────────────────── */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            {error}
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchTasks}
              style={{ marginLeft: 'auto' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ─── Task Grid ────────────────────────────────────────────────── */}
        {loading ? (
          /* Skeleton loaders */
          <div className="task-grid">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 160, borderRadius: 'var(--radius-lg)', animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="task-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  {filter === 'completed' ? '🎉' : filter === 'active' ? '✅' : '📋'}
                </div>
                <p className="empty-state-title">
                  {filter === 'completed'
                    ? 'No completed tasks yet'
                    : filter === 'active'
                    ? 'No active tasks'
                    : 'No tasks yet'}
                </p>
                <p className="empty-state-desc">
                  {filter === 'all'
                    ? 'Click "New Task" to create your first task and start being productive!'
                    : `Switch to a different filter to see your tasks.`}
                </p>
                {filter === 'all' && (
                  <button className="btn btn-primary" onClick={openCreate} id="empty-new-task-btn">
                    <PlusIcon />
                    Create first task
                  </button>
                )}
              </div>
            ) : (
              filtered.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  style={{ animationDelay: `${i * 40}ms` }}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* ─── Task Modal ─────────────────────────────────────────────────── */}
      <TaskModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={editTask ? handleUpdate : handleCreate}
        task={editTask}
      />
    </div>
  )
}
