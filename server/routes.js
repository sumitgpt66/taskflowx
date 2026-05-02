// routes.js - All API Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = 'taskflowx_secret_key_2024';

// ─── Middleware: Verify JWT Token ───────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Middleware: Admin Only ─────────────────────────────────────────────────
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // Simple password comparison (no bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, 'member']);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ─── USER ROUTES ─────────────────────────────────────────────────────────────

// GET /api/users - Get all users (for assign dropdown)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role FROM users ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id/role - Update user role (admin only)
router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ─── PROJECT ROUTES ───────────────────────────────────────────────────────────

// GET /api/projects
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const [result] = await db.query(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || null, req.user.id]
    );

    const [newProject] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(newProject[0]);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ─── TASK ROUTES ─────────────────────────────────────────────────────────────

// GET /api/tasks
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const { project_id, status, assigned_to } = req.query;
    let query = `
      SELECT t.*,
        u.name AS assigned_to_name,
        u2.name AS created_by_name,
        p.name AS project_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) { query += ' AND t.project_id = ?'; params.push(project_id); }
    if (status)     { query += ' AND t.status = ?';     params.push(status); }
    if (assigned_to){ query += ' AND t.assigned_to = ?';params.push(assigned_to); }

    // Restrict to assigned tasks for non-admin users
    if (req.user.role !== 'admin') {
      query += ' AND t.assigned_to = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, project_id, assigned_to, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const [result] = await db.query(
      `INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        project_id || null,
        assigned_to || null,
        req.user.id,
        due_date || null
      ]
    );

    const [newTask] = await db.query(`
      SELECT t.*, u.name AS assigned_to_name, u2.name AS created_by_name, p.name AS project_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `, [result.insertId]);

    res.status(201).json(newTask[0]);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update task status or details
router.put('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, project_id, assigned_to, due_date } = req.body;

    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Task not found' });

    await db.query(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        project_id = COALESCE(?, project_id),
        assigned_to = COALESCE(?, assigned_to),
        due_date = COALESCE(?, due_date)
       WHERE id = ?`,
      [title, description, status, priority, project_id, assigned_to, due_date, id]
    );

    const [updated] = await db.query(`
      SELECT t.*, u.name AS assigned_to_name, u2.name AS created_by_name, p.name AS project_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `, [id]);

    res.json(updated[0]);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Task not found' });

    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ─── STATS ROUTE ─────────────────────────────────────────────────────────────

// GET /api/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    let whereClause = '';
    const params = [];
    if (req.user.role !== 'admin') {
      whereClause = 'WHERE assigned_to = ?';
      params.push(req.user.id);
    }

    const [[{ total_tasks }]] = await db.query('SELECT COUNT(*) AS total_tasks FROM tasks ' + whereClause, params);
    const [[{ todo }]] = await db.query('SELECT COUNT(*) AS todo FROM tasks ' + (whereClause ? whereClause + ' AND' : 'WHERE') + " status = 'todo'", params);
    const [[{ in_progress }]] = await db.query('SELECT COUNT(*) AS in_progress FROM tasks ' + (whereClause ? whereClause + ' AND' : 'WHERE') + " status = 'in_progress'", params);
    const [[{ done }]] = await db.query('SELECT COUNT(*) AS done FROM tasks ' + (whereClause ? whereClause + ' AND' : 'WHERE') + " status = 'done'", params);

    // For projects, count distinct projects from user's tasks
    let projectQuery = 'SELECT COUNT(*) AS total_projects FROM projects';
    if (req.user.role !== 'admin') {
      projectQuery = 'SELECT COUNT(DISTINCT p.id) AS total_projects FROM projects p JOIN tasks t ON p.id = t.project_id WHERE t.assigned_to = ?';
    }
    const [[{ total_projects }]] = await db.query(projectQuery, req.user.role !== 'admin' ? [req.user.id] : []);

    const [[{ total_users }]] = await db.query('SELECT COUNT(*) AS total_users FROM users');

    res.json({ total_tasks, todo, in_progress, done, total_projects, total_users });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
