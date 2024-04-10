import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// checking successful connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Error connecting to the database', err);
  } else {
    console.log('Connected to the database successfully');
  }
});

// request to pull all users from table users
pool.query('SELECT * FROM users', (err, res) => {
  if (err) {
    console.log('Error fetching users', err);
  } else {
    console.log(res.rows);
  }
});

export default {
  query: (text, params) => pool.query(text, params),
};
