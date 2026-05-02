// db.js - MySQL Database Connection
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sumit@123',
  database: process.env.DB_NAME || 'taskflowx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Make sure MySQL is running and credentials are correct in db.js');
  } else {
    console.log('✅ Connected to MySQL database: taskflowx');
    connection.release();
  }
});

module.exports = db;
