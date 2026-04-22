import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root1234',
  database: process.env.DB_NAME || 'dentist_booking',
  waitForConnections: true,
  connectionLimit: 10,
});

export type RowData = any;
export default pool;