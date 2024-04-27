import pool from '../utils/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const AdminModel = {
  async findUserByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`, 
       [email]
    );
    return result.rows[0];
  },

  findAdminByEmail: async function (email) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1 AND role = $2`, 
      [email, 'admin']
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND role = $2`, 
      [id, 'admin']);
    return result.rows[0];
  },

  async createUser(firstName, lastName, email, password, status, role, country, city, state, zip, street, about, color, createTime) {
    const fullAddress = `${street}, ${city}, ${state} ${zip}, ${country}`;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      `INSERT INTO users 
       (first_name, last_name, email, password, status, role, country, city, state, zip, street, full_address, about, color, create_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        firstName, // 1
        lastName, // 2
        email, // 3
        hashedPassword, // 4
        status, // 5
        role, // 6
        country, // 7
        city, // 8
        state, // 9
        zip, // 10
        street, // 11
        fullAddress, // 12
        about, // 13
        color, // 14
        createTime, // 15
      ]
    );
    return result.rows[0];
  },

  // user == either admin or driver
  async updateUserPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query(
      `UPDATE users SET password = $1 WHERE email = $2`, 
      [hashedPassword, email]
    );
  },

  async delete(email) {
    await pool.query('DELETE FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
  },

  async findPendingApplications() {
    const result = await pool.query('SELECT * FROM users WHERE status = $1', ['pending']);
    return result.rows;
  },

  async findApplicationByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findApplicationById (id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async countPendingApplications() {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE status = $1', ['pending']);
    return result.rows[0].count;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
  },

  async getDrivers() {
    const drivers = await pool.query('SELECT * FROM users WHERE role = $1 AND status = $2', ['driver', 'approved']);
    return drivers.rows;
  },

  async getDriverById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'driver']);
    return result.rows[0];
  },

  async getDriverByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1 AND role = $2';
    const result = await pool.query(query, [email, 'driver']);
    return result.rows[0];
  },

};

export default AdminModel;