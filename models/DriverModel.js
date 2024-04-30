import pool from '../utils/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const DriverModel = {

  async findDriverByEmail(email) {
    const query = `
      SELECT * 
      FROM users 
      WHERE email = $1 
      AND role = $2
    `;
    const result = await pool.query(query, [email, 'driver']);
    return result.rows[0];
  },

  async findById(id) {
    const query = `
      SELECT * 
      FROM users 
      WHERE id = $1 
      AND role = $2
    `;
    const result = await pool.query(query, [id, 'driver']);
    return result.rows[0];
  },
  
  async create(name, email, password, role, status) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `
      INSERT INTO users (name, email, password, role, status) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const result = await pool.query(query, [name, email, hashedPassword, role, status]);
    return result.rows[0];
  },

  async delete(email) {
    const query = `
      DELETE FROM users 
      WHERE email = $1 
      AND role = $2
    `;
    await pool.query(query, [email, 'driver']);
  },

  async updateDriverPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `
      UPDATE users 
      SET password = $1 
      WHERE email = $2 
      AND role = $3
    `;
    await pool.query(query, [hashedPassword, email, 'driver']);
  },
  
  async getOptimizedRoute(driverId) {
    const query = `
      SELECT * 
      FROM routes 
      WHERE driverId = $1 
      ORDER BY id DESC 
      LIMIT 1
    `;
    const route = await pool.query(query, [driverId]);
    return route.rows[0];
  },

  async updatePasswordById(id, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `
      UPDATE users 
      SET password = $1 
      WHERE id = $2
    `;
    const values = [hashedPassword, id];
    await pool.query(query, values);
  },
};

export default DriverModel;