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

  async getDeliveryLocationByLatLonAndDriverEmail(latLon, driverEmail) {
    const query = 'SELECT * FROM delivery_locations WHERE lat_lon = $1 AND driver_email = $2';
    const result = await pool.query(query, [latLon, driverEmail]);
    return result.rows[0];
  },

  async getDeliveryLocationsByDriverEmail(driverEmail) {
    const query = 'SELECT * FROM delivery_locations WHERE driver_email = $1 AND status = $2';
    const result = await pool.query(query, [driverEmail, 'pending']);
    return result.rows;
  },

  async getPendingDeliveryLocations() {
    const query = 'SELECT address, driver_email, created_at FROM delivery_locations WHERE status = $1';
    const values = ['pending'];
    const result = await pool.query(query, values);
    return result.rows;
  },
  
  async updateDeliveryLocationStatus(address, driverEmail, status) {
    const query = 'UPDATE delivery_locations SET status = $1 WHERE address = $2 AND driver_email = $3';
    const values = [status, address, driverEmail];
    await pool.query(query, values);
  },

};

export default AddressModel;