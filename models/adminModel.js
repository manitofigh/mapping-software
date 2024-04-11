import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const AdminModel = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'admin']);
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
    await pool.query('DELETE FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
  },
};

export default AdminModel;