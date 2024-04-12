import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const DriverModel = {

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'driver']);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'driver']);
    return result.rows[0];
  },
  
  async create(name, email, password, role, status) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, role, status]
    );
    return result.rows[0];
  },

  async delete(email) {
    await pool.query('DELETE FROM users WHERE email = $1 AND role = $2', [email, 'driver']);
  },

  async updateDriverPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2 AND role = $3', [hashedPassword, email, 'driver']);
  },

  async findPendingApplications() {
    const result = await pool.query('SELECT * FROM users WHERE role = $1 AND status = $2', ['driver', 'pending']);
    return result.rows;
  },

  async countPendingApplications() {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1 AND status = $2', ['driver', 'pending']);
    return parseInt(result.rows[0].count);
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
  },
};

export default DriverModel;