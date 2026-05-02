# 🚀 TaskFlowX – Team Task Manager

TaskFlowX is a full-stack web application that allows teams to manage projects, assign tasks, and track progress with **role-based access control (Admin & Member)**.

---

## 🌐 Live Demo

👉 Frontend: https://your-frontend-url.up.railway.app
👉 Backend: https://your-backend-url.up.railway.app

---

## 📌 Features

### 🔐 Authentication

* User Signup & Login
* JWT-based authentication
* Secure session handling

---

### 👥 Role-Based Access Control

#### 🛡️ Admin

* Create and assign tasks
* Create and manage projects
* View all users
* Change user roles (Admin ↔ Member)
* Full dashboard access

#### 👤 Member

* View assigned tasks
* Update task status
* Limited access (cannot create tasks or manage users)

---

### 📁 Project Management

* Create projects (Admin only)
* View all projects
* Track tasks per project

---

### ✅ Task Management

* Admin can:

  * Create tasks
  * Assign tasks to users
  * Set priority & deadline

* Members can:

  * View assigned tasks
  * Update task status (To Do / In Progress / Done)

---

### 📊 Dashboard

* Total tasks overview
* Completed / Pending tasks
* Project & team insights

---

## 🛠️ Tech Stack

### Frontend

* React (WITHOUT JSX – using `React.createElement`)
* HTML + CSS (Modern UI)

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Authentication

* JWT (JSON Web Token)

### Deployment

* Railway 
* Vercel


---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash id="clone-repo"
git clone https://github.com/your-username/taskflowx.git
cd taskflowx
```

---

### 2️⃣ Setup Backend

```bash id="backend-run"
cd server
npm install
node server.js
```

---

### 3️⃣ Setup Database (MySQL)

Create database:

```sql id="create-db"
CREATE DATABASE taskflowx;
```

Import schema:

```bash id="import-db"
database/schema.sql
```

Update DB credentials in:

```js id="db-config"
server/db.js
```

---

### 4️⃣ Run Frontend

Open:

```id="frontend-run"
client/index.html
```

---

## 👨‍💻 Author

**Sumit Kumar Gupta**
B.Tech CSE | Full Stack Developer

---

## ⭐ Conclusion

TaskFlowX is a scalable team task management system with secure role-based access and modern UI, built using industry-standard technologies.

---
