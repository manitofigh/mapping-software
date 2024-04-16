import pool from '../utils/db.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const AdminModel = {
  async findUserByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  findAdminByEmail: async function (email) {
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

  // user == either admin or driver
  async updateUserPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
  },

  async updateDriverPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2 AND role = $3', [hashedPassword, email, 'driver']);
  },

  async updateAdminPassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2 AND role = $3', [hashedPassword, email, 'admin']);
  },

  async delete(email) {
    await pool.query('DELETE FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
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

  async getDrivers() {
    const drivers = await db.query('SELECT * FROM drivers');
    return drivers.rows;
  },

  async getAddressesForDriver(driverId) {
    const addresses = await db.query('SELECT * FROM addresses WHERE driverId = $1 AND status = $2', [driverId, 'active']);
    return addresses.rows;
  },

  async addAddress(address, latitude, longitude, driverId) {
    const newAddress = await db.query(
      'INSERT INTO addresses (address, latitude, longitude, driverId) VALUES ($1, $2, $3, $4) RETURNING *',
      [address, latitude, longitude, driverId]
    );
    return newAddress.rows[0];
  },

  async deleteAddress(addressId) {
    await db.query('UPDATE addresses SET status = $1 WHERE id = $2', ['inactive', addressId]);
  },  
};

export default AdminModel;