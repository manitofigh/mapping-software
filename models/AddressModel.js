import pool from '../utils/db.js';

const AddressModel = {
  async getGeocodedLocation(address) {
    const query = 'SELECT * FROM geocoded_locations WHERE address = $1';
    const result = await pool.query(query, [address]);
    return result.rows[0];
  },

  async addGeocodedLocation(address, latLon, realAddress, quality) {
    const query = `INSERT INTO geocoded_locations 
                   (address, lat_lon, real_address, quality) 
                   VALUES ($1, $2, $3, $4)`;
    await pool.query(query, [address, latLon, realAddress, quality]);
  },

  async addDeliveryLocation(address, latLon, driverEmail, color, status, createdAt) {
    const query = `INSERT INTO delivery_locations 
                   (address, lat_lon, driver_email, color, status, created_at) 
                   VALUES ($1, $2, $3, $4, $5, $6)`;
    await pool.query(query, [address, latLon, driverEmail, color, status, createdAt]);
  },

};

export default AddressModel;