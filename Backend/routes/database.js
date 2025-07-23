// Backend/database.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chatGPT',
  password: process.env.DB_PASSWORD, // Replace with your actual PostgreSQL password
  port: 5432,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Test the connection immediately
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.log('Database connection test successful:', res.rows[0]);
  }
});

module.exports = pool;
