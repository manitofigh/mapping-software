import pool from '../utils/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const AdminModel = {
  async findUserByEmail(email) {
    const query = `
      SELECT * 
      FROM users 
      WHERE email = $1
    `;
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findAdminByEmail(email) {
    const query = `
      SELECT * 
      FROM users 
      WHERE email = $1 
      AND role = $2
    `;
    const values = [email, 'admin'];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findById(id) {
    const query = `
      SELECT * 
      FROM users 
      WHERE id = $1 
      AND role = $2
    `;
    const values = [id, 'admin'];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async createUser(firstName, lastName, email, password, status, role, country, city, state, zip, street, about, color, createTime) {
    const fullAddress = `${street}, ${city}, ${state} ${zip}, ${country}`;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `
      INSERT INTO users 
      (first_name, last_name, email, password, status, role, country, city, state, zip, street, full_address, about, color, create_time) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *
    `;
    const values = [
      firstName,
      lastName,
      email,
      hashedPassword,
      status,
      role,
      country,
      city,
      state,
      zip,
      street,
      fullAddress,
      about,
      color,
      createTime,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateUserPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `
      UPDATE users 
      SET password = $1 
      WHERE email = $2
    `;
    const values = [hashedPassword, email];
    await pool.query(query, values);
  },

  async delete(email) {
    const query = `
      DELETE FROM users 
      WHERE email = $1 
      AND role = $2
    `;
    const values = [email, 'admin'];
    await pool.query(query, values);
  },

  async findPendingApplications() {
    const query = `
      SELECT * 
      FROM users 
      WHERE status = $1
    `;
    const values = ['pending'];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async findApplicationByEmail(email) {
    const query = `
      SELECT * 
      FROM users 
      WHERE email = $1
    `;
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findApplicationById(id) {
    const query = `
      SELECT * 
      FROM users 
      WHERE id = $1
    `;
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async countPendingApplications() {
    const query = `
      SELECT COUNT(*) 
      FROM users 
      WHERE status = $1
    `;
    const values = ['pending'];
    const result = await pool.query(query, values);
    return result.rows[0].count;
  },

  async updateStatus(id, status) {
    const query = `
      UPDATE users 
      SET status = $1 
      WHERE id = $2
    `;
    const values = [status, id];
    await pool.query(query, values);
  },

  async updateEmailByEmail(email, newEmail) {
    const query = `
      UPDATE users 
      SET email = $1 
      WHERE email = $2
    `;
    const values = [newEmail, email];
    await pool.query(query, values);
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

  async cleanDatabase() {
    const query1 = `
      DELETE FROM delivery_jobs;
    `;
    const query2 = `
      DELETE FROM delivery_locations;
    `;
    const query3 = `
      DELETE FROM trip_geometries;
    `;
    await pool.query(query1);
    await pool.query(query2);
    await pool.query(query3);
  },

  async getDrivers() {
    const query = `
      SELECT * 
      FROM users 
      WHERE role = $1 
      AND (status = $2 OR status = $3)
    `;
    const values = ['driver', 'approved', 'disabled'];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getDriverById(id) {
    const query = `
      SELECT * 
      FROM users 
      WHERE id = $1 
      AND role = $2
    `;
    const values = [id, 'driver'];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getDriverByEmail(email) {
    const query = `
      SELECT * 
      FROM users 
      WHERE email = $1 
      AND role = $2
    `;
    const values = [email, 'driver'];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateDriverColor(email, color) {
    const query1 = `
      UPDATE users SET color = $1 WHERE email = $2;
    `;
    const query2 = `
      UPDATE delivery_jobs SET color = $1 WHERE driver_email = $2;
    `;
    const query3 = `
      UPDATE delivery_locations SET color = $1 WHERE driver_email = $2;
    `;
    const query4 = `
      UPDATE trip_geometries SET color = $1 WHERE driver_email = $2;
    `;
    const values = [color, email];
    await pool.query(query1, values);
    await pool.query(query2, values);
    await pool.query(query3, values);
    await pool.query(query4, values);
  },

};

export default AdminModel;