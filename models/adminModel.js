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

  // create new application with fields 
  // first_name, last_name, email, street, city, state, zip, full_address, about, timestamp, status
  // status is pending by default
  async createApplication(application) {
    const fullAddress = `${application.street}, ${application.city}, ${application.state} ${application.zip}`;
    // timestamp like April 17, 2024 at 14:22
    const currentDate = new Date();
    const datePart = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const timePart = currentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
    });
    
    const timestamp = `${datePart} at ${timePart}`;

    const result = await pool.query(
      `INSERT INTO applications 
       (first_name, last_name, email, street, city, state, zip, full_address, about, timestamp, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        application.firstName,
        application.lastName,
        application.email,
        application.street,
        application.city,
        application.state,
        application.zip,
        fullAddress,
        application.about,
        timestamp,
        'pending',
      ]
    );
    return result.rows[0];
  },

  async findPendingApplications() {
    const result = await pool.query('SELECT * FROM applications WHERE status = $1', ['pending']);
    return result.rows;
  },

  async findApplicationByEmail(email) {
    const result = await pool.query('SELECT * FROM applications WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findApplicationById (id) {
    const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    return result.rows[0];
  },

  async countPendingApplications() {
    const result = await pool.query('SELECT COUNT(*) FROM applications WHERE status = $1', ['pending']);
    return result.rows[0].count;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE applications SET status = $1 WHERE id = $2', [status, id]);
  },

  async getDrivers() {
    const drivers = await pool.query('SELECT * FROM users WHERE role = $1 AND status = $2', ['driver', 'approved']);
    return drivers.rows;
  },

  async getAddressesForDriver(driverId) {
    const addresses = await pool.query('SELECT * FROM addresses WHERE driverId = $1 AND status = $2', [driverId, 'active']);
    return addresses.rows;
  },

  async addAddress(address, latitude, longitude, driverId) {
    const newAddress = await pool.query(
      'INSERT INTO addresses (address, latitude, longitude, driver_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [address, latitude, longitude, driverId, 'active']
    );
    return newAddress.rows[0];
  },

  async deleteAddress(addressId) {
    await pool.query('UPDATE addresses SET status = $1 WHERE id = $2', ['inactive', addressId]);
  },  
};

export default AdminModel;