import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root1234',  // Хэрэв нууц үгтэй бол энд бичнэ
  database: 'dentist_booking',
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;