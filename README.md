# 🚀 TaskFlowX – Team Task Manager

A production-ready full-stack task management web application.

## Tech Stack
- **Frontend**: React 18 (NO JSX — React.createElement only)
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Auth**: JWT tokens

---

## 📁 Project Structure

```
taskflowx/
├── database/
│   └── schema.sql          # MySQL schema + seed data
├── server/
│   ├── server.js           # Express main server
│   ├── db.js               # MySQL connection pool
│   ├── routes.js           # All API routes
│   └── package.json        # Backend dependencies
└── client/
    ├── index.html          # Entry HTML
    ├── style.css           # Full design system
    └── app.js              # React app (no JSX)
```

---

## ⚡ Quick Start

### Step 1: Database Setup

1. Open MySQL Workbench or terminal and run:
```sql
source /path/to/taskflowx/database/schema.sql
```

Or via terminal:
```bash
mysql -u root -p < database/schema.sql
```

This creates:
- `taskflowx` database
- `users`, `projects`, `tasks` tables
- Sample admin user: `admin@gmail.com` / `1234`
- Sample data to explore

### Step 2: Configure Database Credentials

Edit `server/db.js`:
```js
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // ← Your MySQL username
  password: '',        // ← Your MySQL password
  database: 'taskflowx'
});
```

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 4: Start the Backend

```bash
node server.js
```

You should see:
```
✅ Connected to MySQL database: taskflowx
╔════════════════════════════════════════╗
║      🚀 TaskFlowX Server Started        ║
║  URL:  http://127.0.0.1:5000           ║
╚════════════════════════════════════════╝
```

### Step 5: Open the Frontend

Simply open the client folder in a browser:
```
Open: taskflowx/client/index.html
```

**Option A** – Double-click `index.html` in file explorer  
**Option B** – Use VS Code Live Server extension  
**Option C** – Serve with Python:
```bash
cd client
python -m http.server 3000
# Open: http://localhost:3000
```
**Option D** – Use npx serve:
```bash
cd client
npx serve .
```

---

## 🔑 Login Credentials

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | admin@gmail.com   | 1234     |
| Member| alice@gmail.com   | alice123 |
| Member| bob@gmail.com     | bob123   |

---

## 🌐 API Endpoints

| Method | Route            | Auth | Description            |
|--------|------------------|------|------------------------|
| POST   | /api/login       | No   | Login, returns JWT     |
| GET    | /api/tasks       | Yes  | Get all tasks          |
| POST   | /api/tasks       | Yes  | Create task            |
| PUT    | /api/tasks/:id   | Yes  | Update task            |
| DELETE | /api/tasks/:id   | Yes  | Delete task            |
| GET    | /api/projects    | Yes  | Get all projects       |
| POST   | /api/projects    | Yes  | Create project         |
| GET    | /api/users       | Yes  | Get all users          |
| GET    | /api/stats       | Yes  | Dashboard stats        |

---

## ✨ Features

- **Login** with JWT authentication
- **Dashboard** with live stats (total tasks, todo/in-progress/done, projects, team size)
- **Tasks List** with status/project filters, delete, mark as done
- **Kanban Board** – three-column view (To Do / In Progress / Done)
- **Projects** – grid view with task counts
- **Add Task Modal** – title, description, status, priority, project, assignee, due date
- **Add Project Modal**
- **Toast notifications** for all actions
- **Logout** via sidebar user panel

---

## 🛠 Troubleshooting

**Cannot connect to MySQL:**
- Make sure MySQL is running: `sudo service mysql start` (Linux) or start via MySQL Workbench
- Check credentials in `server/db.js`

**CORS errors in browser:**
- Make sure backend is running on port 5000
- Ensure you're opening the HTML file in a browser (not a restricted environment)

**Login fails:**
- Make sure you ran `schema.sql` to insert the sample user
- Verify credentials: `admin@gmail.com` / `1234`

**Port 5000 in use:**
- Change `const PORT = 5000;` in `server.js` to another port (e.g. 5001)
- Update `const API = 'http://127.0.0.1:5000/api';` in `client/app.js` to match
