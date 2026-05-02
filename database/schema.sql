-- TaskFlowX Database Schema
-- Run this file to set up the database

CREATE DATABASE IF NOT EXISTS taskflowx;
USE taskflowx;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  project_id INT,
  assigned_to INT,
  created_by INT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Sample Data

-- Admin user (password: 1234)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User', 'admin@gmail.com', '1234', 'admin'),
  ('Alice Johnson', 'alice@gmail.com', 'alice123', 'member'),
  ('Bob Smith', 'bob@gmail.com', 'bob123', 'member');

-- Sample projects
INSERT INTO projects (name, description, created_by) VALUES
  ('Website Redesign', 'Redesign the company website with modern UI', 1),
  ('Mobile App', 'Build iOS and Android app', 1),
  ('API Integration', 'Integrate third-party APIs', 1);

-- Sample tasks
INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by) VALUES
  ('Design homepage mockup', 'Create Figma mockups for homepage', 'in_progress', 'high', 1, 2, 1),
  ('Set up React project', 'Initialize React app with routing', 'done', 'high', 1, 3, 1),
  ('Build login screen', 'Create login and register screens', 'todo', 'medium', 2, 2, 1),
  ('Write API documentation', 'Document all REST endpoints', 'todo', 'low', 3, 3, 1),
  ('Fix navigation bug', 'Menu does not close on mobile', 'in_progress', 'high', 1, 2, 1),
  ('Setup CI/CD pipeline', 'Configure GitHub Actions for deployment', 'todo', 'medium', 2, 1, 1);
