import mysql from 'mysql2/promise';

// DB_PASSWORD-г шалгах: Хэрэв утга нь 'placeholder' бол хоосон string болгоно
const dbPassword = process.env.DB_PASSWORD === 'placeholder' ? '' : process.env.DB_PASSWORD;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: dbPassword,  // Шинэчлэгдсэн хувьсагчийг ашиглана
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;