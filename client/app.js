// ═══════════════════════════════════════════════════════════════
// TaskFlowX – Full React App (NO JSX – React.createElement only)
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect, useCallback, useRef } = React;
const e = React.createElement;

// Use environment variable for API URL, fallback to localhost for development
const API = window.__TASKFLOWX_API_URL__ || 'http://127.0.0.1:5000/api';

// ─── Utilities ────────────────────────────────────────────────

function getToken() { return localStorage.getItem('tfx_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('tfx_user') || 'null'); }

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(opts.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

// ─── Toast System ──────────────────────────────────────────────
let _toastId = 0;
let _setToasts = null;

function showToast(msg, type = 'info') {
  if (!_setToasts) return;
  const id = ++_toastId;
  _setToasts(t => [...t, { id, msg, type }]);
  setTimeout(() => _setToasts(t => t.filter(x => x.id !== id)), 3500);
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; return () => { _setToasts = null; }; }, []);
  return e('div', { id: 'toast' },
    toasts.map(t =>
      e('div', { key: t.id, className: `toast-item toast-${t.type}` }, t.msg)
    )
  );
}

// ─── Modal ─────────────────────────────────────────────────────
function Modal({ title, onClose, footer, children }) {
  useEffect(() => {
    const handler = ev => { if (ev.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return e('div', {
    className: 'modal-overlay',
    onClick: ev => { if (ev.target.classList.contains('modal-overlay')) onClose(); }
  },
    e('div', { className: 'modal-box' },
      e('div', { className: 'modal-header' },
        e('h3', null, title),
        e('button', { className: 'btn-icon', onClick: onClose }, '✕')
      ),
      e('div', { className: 'modal-body' }, children),
      footer && e('div', { className: 'modal-footer' }, footer)
    )
  );
}

// ─── Login Page ────────────────────────────────────────────────
function LoginPage({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!email || !password) { setError('Both fields are required'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('tfx_token', data.token);
      localStorage.setItem('tfx_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}! 👋`, 'success');
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return e('div', { className: 'login-page' },
    e('div', { className: 'login-box' },
      e('div', { className: 'login-logo' },
        e('div', { className: 'login-logo-icon' }, '⚡'),
        e('h1', null, 'Task', e('span', null, 'Flow'), 'X'),
        e('p', null, 'Team Task Management Platform')
      ),
      e('div', { className: 'login-card' },
        e('h2', null, 'Sign in to your workspace'),
        error && e('div', { className: 'login-error' }, '⚠ ' + error),
        e('form', { onSubmit: handleSubmit },
          e('div', { className: 'form-group' },
            e('label', null, 'Email Address'),
            e('input', {
              type: 'email',
              value: email,
              onChange: ev => setEmail(ev.target.value),
              placeholder: 'you@example.com',
              autoComplete: 'email'
            })
          ),
          e('div', { className: 'form-group' },
            e('label', null, 'Password'),
            e('input', {
              type: 'password',
              value: password,
              onChange: ev => setPassword(ev.target.value),
              placeholder: '••••••••',
              autoComplete: 'current-password'
            })
          ),
          e('button', { type: 'submit', className: 'btn-primary', disabled: loading },
            loading ? e('span', { className: 'spinner' }) : null,
            loading ? ' Signing in…' : '→ Sign In'
          )
        ),
        e('div', { className: 'login-footer' },
          e('button', { className: 'btn-link', onClick: onSwitch }, "Don't have an account? Sign up")
        )
      )
    ),
    e(ToastContainer)
  );
}

// ─── Signup Page ───────────────────────────────────────────────
function SignupPage({ onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!name || !email || !password) { setError('All fields are required'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await apiFetch('/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      showToast('Account created successfully! Please sign in.', 'success');
      onSwitch();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return e('div', { className: 'login-page' },
    e('div', { className: 'login-box' },
      e('div', { className: 'login-logo' },
        e('div', { className: 'login-logo-icon' }, '⚡'),
        e('h1', null, 'Task', e('span', null, 'Flow'), 'X'),
        e('p', null, 'Team Task Management Platform')
      ),
      e('div', { className: 'login-card' },
        e('h2', null, 'Create your account'),
        error && e('div', { className: 'login-error' }, '⚠ ' + error),
        e('form', { onSubmit: handleSubmit },
          e('div', { className: 'form-group' },
            e('label', null, 'Full Name'),
            e('input', {
              type: 'text',
              value: name,
              onChange: ev => setName(ev.target.value),
              placeholder: 'John Doe',
              autoComplete: 'name'
            })
          ),
          e('div', { className: 'form-group' },
            e('label', null, 'Email Address'),
            e('input', {
              type: 'email',
              value: email,
              onChange: ev => setEmail(ev.target.value),
              placeholder: 'you@example.com',
              autoComplete: 'email'
            })
          ),
          e('div', { className: 'form-group' },
            e('label', null, 'Password'),
            e('input', {
              type: 'password',
              value: password,
              onChange: ev => setPassword(ev.target.value),
              placeholder: '••••••••',
              autoComplete: 'new-password'
            })
          ),
          e('div', { className: 'form-group' },
            e('label', null, 'Confirm Password'),
            e('input', {
              type: 'password',
              value: confirm,
              onChange: ev => setConfirm(ev.target.value),
              placeholder: '••••••••',
              autoComplete: 'new-password'
            })
          ),
          e('button', { type: 'submit', className: 'btn-primary', disabled: loading },
            loading ? e('span', { className: 'spinner' }) : null,
            loading ? ' Creating account…' : '→ Create Account'
          )
        ),
        e('div', { className: 'login-footer' },
          e('button', { className: 'btn-link', onClick: onSwitch }, 'Already have an account? Sign in')
        )
      )
    ),
    e(ToastContainer)
  );
}

// ─── Sidebar ───────────────────────────────────────────────────
function Sidebar({ user, view, setView, taskCount, projectCount, onLogout }) {
  const navItems = [
    { id: 'dashboard', icon: '◈', label: 'Dashboard' },
    { id: 'tasks',     icon: '✦', label: 'Tasks',    badge: taskCount },
    { id: 'kanban',    icon: '▦', label: 'Kanban' },
    { id: 'projects',  icon: '◉', label: 'Projects', badge: projectCount },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'users', icon: '👥', label: 'Users' });
  }

  return e('aside', { className: 'sidebar' },
    e('div', { className: 'sidebar-brand' },
      e('div', { className: 'sidebar-brand-icon' }, '⚡'),
      e('div', { className: 'sidebar-brand-name' }, 'Task', e('span', null, 'Flow'), 'X')
    ),
    e('div', { className: 'sidebar-section' },
      e('div', { className: 'sidebar-section-label' }, 'Navigation'),
      navItems.map(item =>
        e('div', {
          key: item.id,
          className: 'sidebar-nav-item' + (view === item.id ? ' active' : ''),
          onClick: () => setView(item.id)
        },
          e('span', { className: 'sidebar-nav-icon' }, item.icon),
          item.label,
          item.badge != null
            ? e('span', { className: 'sidebar-nav-badge' }, item.badge)
            : null
        )
      )
    ),
    e('div', { className: 'sidebar-footer' },
      e('div', { className: 'sidebar-user', onClick: onLogout, title: 'Click to logout' },
        e('div', { className: 'sidebar-avatar' }, initials(user.name)),
        e('div', { className: 'sidebar-user-info' },
          e('div', { className: 'sidebar-user-name' }, user.name),
          e('div', { className: 'sidebar-user-role' }, user.role + ' · logout')
        )
      )
    )
  );
}

// ─── Add Task Modal ────────────────────────────────────────────
function AddTaskModal({ onClose, onAdd, projects, users }) {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo',
    priority: 'medium', project_id: '', assigned_to: '', due_date: ''
  });
  const [loading, setLoading] = useState(false);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!form.title.trim()) { showToast('Task title is required', 'error'); return; }
    setLoading(true);
    try {
      const task = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          project_id: form.project_id || null,
          assigned_to: form.assigned_to || null,
          due_date: form.due_date || null
        })
      });
      onAdd(task);
      showToast('Task created!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return e(Modal, {
    title: '+ New Task',
    onClose,
    footer: e(React.Fragment, null,
      e('button', { className: 'btn-secondary', onClick: onClose }, 'Cancel'),
      e('button', { className: 'btn-primary', onClick: handleSubmit, disabled: loading },
        loading ? '...' : 'Create Task'
      )
    )
  },
    e('form', { onSubmit: handleSubmit },
      e('div', { className: 'form-group' },
        e('label', null, 'Title *'),
        e('input', {
          type: 'text',
          value: form.title,
          onChange: ev => set('title', ev.target.value),
          placeholder: 'What needs to be done?',
          autoFocus: true
        })
      ),
      e('div', { className: 'form-group' },
        e('label', null, 'Description'),
        e('textarea', {
          value: form.description,
          onChange: ev => set('description', ev.target.value),
          placeholder: 'Add more details…'
        })
      ),
      e('div', { className: 'form-row' },
        e('div', { className: 'form-group' },
          e('label', null, 'Status'),
          e('select', { value: form.status, onChange: ev => set('status', ev.target.value) },
            e('option', { value: 'todo' },        'To Do'),
            e('option', { value: 'in_progress' }, 'In Progress'),
            e('option', { value: 'done' },        'Done')
          )
        ),
        e('div', { className: 'form-group' },
          e('label', null, 'Priority'),
          e('select', { value: form.priority, onChange: ev => set('priority', ev.target.value) },
            e('option', { value: 'low' },    'Low'),
            e('option', { value: 'medium' }, 'Medium'),
            e('option', { value: 'high' },   'High')
          )
        )
      ),
      e('div', { className: 'form-row' },
        e('div', { className: 'form-group' },
          e('label', null, 'Project'),
          e('select', { value: form.project_id, onChange: ev => set('project_id', ev.target.value) },
            e('option', { value: '' }, '— None —'),
            projects.map(p => e('option', { key: p.id, value: p.id }, p.name))
          )
        ),
        e('div', { className: 'form-group' },
          e('label', null, 'Assign To'),
          e('select', { value: form.assigned_to, onChange: ev => set('assigned_to', ev.target.value) },
            e('option', { value: '' }, '— Unassigned —'),
            users.map(u => e('option', { key: u.id, value: u.id }, u.name))
          )
        )
      ),
      e('div', { className: 'form-group' },
        e('label', null, 'Due Date'),
        e('input', {
          type: 'date',
          value: form.due_date,
          onChange: ev => set('due_date', ev.target.value)
        })
      )
    )
  );
}

// ─── Add Project Modal ─────────────────────────────────────────
function AddProjectModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!name.trim()) { showToast('Project name is required', 'error'); return; }
    setLoading(true);
    try {
      const project = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description: desc })
      });
      onAdd(project);
      showToast('Project created!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return e(Modal, {
    title: '+ New Project',
    onClose,
    footer: e(React.Fragment, null,
      e('button', { className: 'btn-secondary', onClick: onClose }, 'Cancel'),
      e('button', { className: 'btn-primary', onClick: handleSubmit, disabled: loading },
        loading ? '...' : 'Create Project'
      )
    )
  },
    e('div', { className: 'form-group' },
      e('label', null, 'Project Name *'),
      e('input', {
        type: 'text', value: name,
        onChange: ev => setName(ev.target.value),
        placeholder: 'e.g. Website Redesign',
        autoFocus: true
      })
    ),
    e('div', { className: 'form-group' },
      e('label', null, 'Description'),
      e('textarea', {
        value: desc,
        onChange: ev => setDesc(ev.target.value),
        placeholder: 'What is this project about?'
      })
    )
  );
}

// ─── Dashboard View ────────────────────────────────────────────
function DashboardView({ stats, tasks, loading }) {
  const recent = tasks.slice(0, 5);

  return e('div', null,
    e('div', { className: 'stats-grid' },
      e('div', { className: 'stat-card stat-total' },
        e('div', { className: 'stat-icon' }, '📋'),
        e('div', { className: 'stat-label' }, 'Total Tasks'),
        e('div', { className: 'stat-value' }, stats.total_tasks ?? '–')
      ),
      e('div', { className: 'stat-card stat-todo' },
        e('div', { className: 'stat-icon' }, '📌'),
        e('div', { className: 'stat-label' }, 'To Do'),
        e('div', { className: 'stat-value' }, stats.todo ?? '–')
      ),
      e('div', { className: 'stat-card stat-prog' },
        e('div', { className: 'stat-icon' }, '⚙️'),
        e('div', { className: 'stat-label' }, 'In Progress'),
        e('div', { className: 'stat-value' }, stats.in_progress ?? '–')
      ),
      e('div', { className: 'stat-card stat-done' },
        e('div', { className: 'stat-icon' }, '✅'),
        e('div', { className: 'stat-label' }, 'Done'),
        e('div', { className: 'stat-value' }, stats.done ?? '–')
      ),
      e('div', { className: 'stat-card' },
        e('div', { className: 'stat-icon' }, '📁'),
        e('div', { className: 'stat-label' }, 'Projects'),
        e('div', { className: 'stat-value', style: { color: 'var(--text-primary)' } },
          stats.total_projects ?? '–'
        )
      ),
      e('div', { className: 'stat-card' },
        e('div', { className: 'stat-icon' }, '👥'),
        e('div', { className: 'stat-label' }, 'Team Members'),
        e('div', { className: 'stat-value', style: { color: 'var(--text-primary)' } },
          stats.total_users ?? '–'
        )
      )
    ),

    e('div', { className: 'section-header' },
      e('div', { className: 'section-title' }, 'Recent Tasks')
    ),

    loading
      ? e('div', { className: 'loading-state' }, e('div', { className: 'spinner' }), 'Loading tasks…')
      : e('div', { className: 'task-table-wrap' },
          e('table', { className: 'task-table' },
            e('thead', null,
              e('tr', null,
                e('th', null, 'Task'),
                e('th', null, 'Status'),
                e('th', null, 'Priority'),
                e('th', null, 'Project'),
                e('th', null, 'Assigned To')
              )
            ),
            e('tbody', null,
              recent.length === 0
                ? e('tr', null, e('td', { colSpan: 5 },
                    e('div', { className: 'empty-state' },
                      e('div', { className: 'empty-state-icon' }, '📭'),
                      e('p', null, 'No tasks yet. Create your first task!')
                    )
                  ))
                : recent.map(task => TaskRow({ task, onDelete: null, compact: true }))
            )
          )
        )
  );
}

// ─── Task Row ──────────────────────────────────────────────────
function TaskRow({ task, onDelete, onStatusChange, compact }) {
  return e('tr', { key: task.id },
    e('td', { className: 'task-title-cell' },
      e('div', null, task.title),
      !compact && task.description
        ? e('div', { className: 'task-desc' }, task.description)
        : null
    ),
    e('td', null,
      e('span', { className: `badge badge-${task.status}` },
        task.status === 'todo' ? '● To Do'
          : task.status === 'in_progress' ? '◎ In Progress'
          : '✓ Done'
      )
    ),
    e('td', null,
      e('span', { className: `badge badge-${task.priority}` },
        task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : '—'
      )
    ),
    e('td', null, e('span', { style: { color: 'var(--text-secondary)', fontSize: '0.82rem' } },
      task.project_name || '—'
    )),
    e('td', null, e('span', { style: { color: 'var(--text-muted)', fontSize: '0.82rem' } },
      task.assigned_to_name || 'Unassigned'
    )),
    !compact && onDelete
      ? e('td', null,
          e('div', { className: 'task-actions' },
            onStatusChange && task.status !== 'done' && e('button', {
              className: 'btn-ghost',
              title: 'Mark as done',
              onClick: () => onStatusChange(task.id, 'done')
            }, '✓'),
            e('button', {
              className: 'btn-danger',
              onClick: () => onDelete(task.id)
            }, '✕')
          )
        )
      : null
  );
}

// ─── Tasks View ────────────────────────────────────────────────
function TasksView({ tasks, setTasks, projects, users, onAddClick }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = tasks.filter(t =>
    (!statusFilter  || t.status     === statusFilter) &&
    (!projectFilter || String(t.project_id) === projectFilter)
  );

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await apiFetch('/tasks/' + id, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Task deleted', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      const updated = await apiFetch('/tasks/' + id, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      showToast('Task updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return e('div', null,
    e('div', { className: 'filter-bar' },
      e('span', { className: 'filter-label' }, 'Filter:'),
      e('select', { value: statusFilter, onChange: ev => setStatusFilter(ev.target.value) },
        e('option', { value: '' }, 'All Statuses'),
        e('option', { value: 'todo' },        'To Do'),
        e('option', { value: 'in_progress' }, 'In Progress'),
        e('option', { value: 'done' },        'Done')
      ),
      e('select', { value: projectFilter, onChange: ev => setProjectFilter(ev.target.value) },
        e('option', { value: '' }, 'All Projects'),
        projects.map(p => e('option', { key: p.id, value: String(p.id) }, p.name))
      ),
      filtered.length !== tasks.length
        && e('button', { className: 'btn-ghost', onClick: () => { setStatusFilter(''); setProjectFilter(''); } }, '✕ Clear')
    ),
    e('div', { className: 'task-table-wrap' },
      e('table', { className: 'task-table' },
        e('thead', null,
          e('tr', null,
            e('th', null, 'Task'),
            e('th', null, 'Status'),
            e('th', null, 'Priority'),
            e('th', null, 'Project'),
            e('th', null, 'Assigned To'),
            e('th', null, 'Actions')
          )
        ),
        e('tbody', null,
          filtered.length === 0
            ? e('tr', null, e('td', { colSpan: 6 },
                e('div', { className: 'empty-state' },
                  e('div', { className: 'empty-state-icon' }, '🎯'),
                  e('p', null, 'No tasks found. Try adjusting filters or create a new task.')
                )
              ))
            : filtered.map(task => TaskRow({ task, onDelete: handleDelete, onStatusChange: handleStatusChange, compact: false }))
        )
      )
    )
  );
}

// ─── Kanban View ───────────────────────────────────────────────
function KanbanView({ tasks }) {
  const cols = [
    { id: 'todo',        label: 'To Do',       icon: '○', color: 'var(--text-secondary)' },
    { id: 'in_progress', label: 'In Progress',  icon: '◎', color: 'var(--blue)' },
    { id: 'done',        label: 'Done',         icon: '●', color: 'var(--green)' }
  ];

  return e('div', { className: 'kanban-board' },
    cols.map(col => {
      const colTasks = tasks.filter(t => t.status === col.id);
      return e('div', { key: col.id, className: 'kanban-col' },
        e('div', { className: 'kanban-col-header' },
          e('div', { className: 'kanban-col-title' },
            e('span', { style: { color: col.color } }, col.icon),
            col.label
          ),
          e('span', { className: 'kanban-col-count' }, colTasks.length)
        ),
        e('div', { className: 'kanban-cards' },
          colTasks.length === 0
            ? e('div', { style: { padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' } },
                'No tasks here'
              )
            : colTasks.map(task =>
                e('div', { key: task.id, className: 'kanban-card' },
                  e('div', { className: 'kanban-card-title' }, task.title),
                  e('div', { className: 'kanban-card-meta' },
                    e('span', { className: `badge badge-${task.priority}` },
                      task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : '—'
                    ),
                    e('span', { className: 'kanban-card-assignee' },
                      '👤 ', task.assigned_to_name || 'Unassigned'
                    )
                  ),
                  task.project_name && e('div', {
                    style: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }
                  }, '📁 ' + task.project_name)
                )
              )
        )
      );
    })
  );
}

// ─── Projects View ─────────────────────────────────────────────
function ProjectsView({ projects, setProjects, onAddClick }) {
  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return;
    try {
      await apiFetch('/projects/' + id, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast('Project deleted', 'info');
    } catch (err) {
      showToast('Cannot delete: ' + err.message, 'error');
    }
  }

  return e('div', null,
    projects.length === 0
      ? e('div', { className: 'empty-state', style: { padding: '64px 20px' } },
          e('div', { className: 'empty-state-icon' }, '📁'),
          e('p', null, 'No projects yet. Create your first project!')
        )
      : e('div', { className: 'projects-grid' },
          projects.map(p =>
            e('div', { key: p.id, className: 'project-card' },
              e('div', { className: 'project-card-icon' }, '📁'),
              e('div', { className: 'project-card-name' }, p.name),
              e('div', { className: 'project-card-desc' },
                p.description || 'No description provided.'
              ),
              e('div', { className: 'project-card-footer' },
                e('span', { className: 'project-task-count' },
                  '✦ ', p.task_count || 0, ' tasks'
                ),
                e('span', { style: { color: 'var(--text-muted)', fontSize: '0.72rem' } },
                  'by ' + (p.created_by_name || 'Admin')
                )
              )
            )
          )
        )
  );
}

// ─── Users View ────────────────────────────────────────────────
function UsersView({ users, setUsers, currentUser }) {
  async function handleRoleChange(id, newRole) {
    try {
      await apiFetch('/users/' + id + '/role', {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      showToast('Role updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return e('div', null,
    users.length === 0
      ? e('div', { className: 'empty-state', style: { padding: '64px 20px' } },
          e('div', { className: 'empty-state-icon' }, '👥'),
          e('p', null, 'No users found.')
        )
      : e('div', { className: 'projects-grid' },
          users.map(u =>
            e('div', { key: u.id, className: 'project-card' },
              e('div', { className: 'project-card-icon' }, initials(u.name)),
              e('div', { className: 'project-card-name' }, u.name),
              e('div', { className: 'project-card-desc' }, u.email),
              e('div', { className: 'project-card-footer' },
                currentUser.role === 'admin' && u.id !== currentUser.id
                  ? e('select', {
                      value: u.role,
                      onChange: ev => handleRoleChange(u.id, ev.target.value),
                      style: { fontSize: '0.8rem', padding: '4px' }
                    },
                      e('option', { value: 'member' }, 'Member'),
                      e('option', { value: 'admin' }, 'Admin')
                    )
                  : e('span', { style: { color: 'var(--text-muted)', fontSize: '0.72rem' } },
                      u.role.charAt(0).toUpperCase() + u.role.slice(1)
                    )
              )
            )
          )
        )
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p, u, s] = await Promise.all([
        apiFetch('/tasks'),
        apiFetch('/projects'),
        apiFetch('/users'),
        apiFetch('/stats')
      ]);
      setTasks(t);
      setProjects(p);
      setUsers(u);
      setStats(s);
    } catch (err) {
      showToast('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, []);

  const viewTitles = {
    dashboard: '◈ Dashboard',
    tasks:     '✦ All Tasks',
    kanban:    '▦ Kanban Board',
    projects:  '◉ Projects',
    users:     '👥 Users'
  };

  function handleLogout() {
    localStorage.removeItem('tfx_token');
    localStorage.removeItem('tfx_user');
    onLogout();
  }

  const topbarActions = () => {
    if ((view === 'tasks' || view === 'dashboard') && user.role === 'admin') {
      return e('button', { className: 'btn-primary', onClick: () => setShowAddTask(true) }, '+ New Task');
    }
    if (view === 'projects') {
      return e('button', { className: 'btn-primary', onClick: () => setShowAddProject(true) }, '+ New Project');
    }
    if (view === 'kanban' && user.role === 'admin') {
      return e('button', { className: 'btn-primary', onClick: () => setShowAddTask(true) }, '+ New Task');
    }
    return null;
  };

  const renderView = () => {
    if (loading) return e('div', { className: 'loading-state' },
      e('div', { className: 'spinner' }), 'Loading your workspace…'
    );
    switch (view) {
      case 'dashboard': return e(DashboardView, { stats, tasks, loading: false });
      case 'tasks':     return e(TasksView, { tasks, setTasks, projects, users });
      case 'kanban':    return e(KanbanView, { tasks });
      case 'projects':  return e(ProjectsView, { projects, setProjects });
      case 'users':     return e(UsersView, { users, setUsers, currentUser: user });
      default: return null;
    }
  };

  return e('div', { className: 'app-layout' },
    e(Sidebar, {
      user,
      view,
      setView,
      taskCount: tasks.length,
      projectCount: projects.length,
      onLogout: handleLogout
    }),
    e('div', { className: 'main-content' },
      e('div', { className: 'topbar' },
        e('div', { className: 'topbar-title' }, viewTitles[view] || 'TaskFlowX'),
        e('div', { className: 'topbar-actions' },
          e('button', { className: 'btn-icon', onClick: loadAll, title: 'Refresh' }, '↻'),
          topbarActions()
        )
      ),
      e('div', { className: 'content-area' },
        renderView()
      )
    ),

    showAddTask && e(AddTaskModal, {
      onClose: () => setShowAddTask(false),
      onAdd: task => {
        setTasks(prev => [task, ...prev]);
        setStats(s => ({ ...s, total_tasks: (s.total_tasks || 0) + 1,
          [task.status]: (s[task.status] || 0) + 1 }));
      },
      projects,
      users
    }),

    showAddProject && e(AddProjectModal, {
      onClose: () => setShowAddProject(false),
      onAdd: proj => {
        setProjects(prev => [proj, ...prev]);
        setStats(s => ({ ...s, total_projects: (s.total_projects || 0) + 1 }));
      }
    }),

    e(ToastContainer)
  );
}

// ─── Root App ──────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(() => getUser());
  const [isSignup, setIsSignup] = useState(false);

  function handleLogin(u) { setUser(u); setIsSignup(false); }
  function handleLogout() { setUser(null); }
  function handleSwitch() { setIsSignup(!isSignup); }

  if (!user || !getToken()) {
    return isSignup
      ? e(SignupPage, { onSwitch: handleSwitch })
      : e(LoginPage, { onLogin: handleLogin, onSwitch: handleSwitch });
  }
  return e(Dashboard, { user, onLogout: handleLogout });
}

// ─── Mount ─────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
