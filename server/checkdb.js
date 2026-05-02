const mysql = require('mysql2/promise');

async function checkDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sumit@123',
    database: 'taskflowx'
  });

  const [rows] = await connection.execute('SHOW TABLES');
  console.log('Tables:', rows);

  for (const row of rows) {
    const tableName = Object.values(row)[0];
    const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
    console.log(`Table ${tableName}:`, columns.map(c => c.Field));
  }

  await connection.end();
}

checkDB().catch(console.error);