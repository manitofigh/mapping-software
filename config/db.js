import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// check connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('ERROR connecting to the database', err);
  } else {
    console.log(`Connected to the DATBASE:${process.env.DB_NAME} SUCCESSFULLY as USER:${process.env.DB_USER}`);
  }
});

export default pool;