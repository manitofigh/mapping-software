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
    const query = 'SELECT address, driver_email, created_at, lat_lon, color FROM delivery_locations WHERE status = $1';
    const values = ['pending'];
    const result = await pool.query(query, values);
    return result.rows;
  },
  
  async updateDeliveryLocationStatus(address, driverEmail, status) {
    const query = 'UPDATE delivery_locations SET status = $1 WHERE address = $2 AND driver_email = $3';
    const values = [status, address, driverEmail];
    await pool.query(query, values);
  },

  async updateDeliveryJobStatus(id, status) {
    const query = 'UPDATE delivery_jobs SET status = $1 WHERE id = $2';
    const values = [status, id];
    await pool.query(query, values);
  },

  async getPendingDeliveryLocationsByDriverEmail(driverEmail) {
    const query = 'SELECT * FROM delivery_locations WHERE driver_email = $1 AND status = $2';
    const result = await pool.query(query, [driverEmail, 'pending']);
    return result.rows;
  },

  async getDeliveryJobsByDriverEmailAndTripNumber(driverEmail, tripNumber) {
    const query = 'SELECT * FROM delivery_jobs WHERE driver_email = $1 AND trip_number = $2 ORDER BY waypoint_index';
    const values = [driverEmail, tripNumber];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getHighestTripNumberByDriverEmail(driverEmail) {
    const query = `
      SELECT MAX(trip_number) AS highest_trip_number
      FROM trip_geometries
      WHERE driver_email = $1 AND status = 'completed';
    `;
  
    const result = await pool.query(query, [driverEmail]);
    return result.rows[0].highest_trip_number;
  },

  async getHighestPendingTripNumberByDriverEmail(driverEmail) {
    const query = 'SELECT MAX(trip_number) AS highest_trip_number FROM trip_geometries WHERE driver_email = $1 AND status = $2';
    const values = [driverEmail, 'pending'];
    const result = await pool.query(query, values);
    return result.rows[0].highest_trip_number;
  },

  async createTripGeometry(driverEmail, tripNumber, geometry, color) {
    const query = `
      INSERT INTO trip_geometries (driver_email, trip_number, geometry, color)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [driverEmail, tripNumber, geometry, color];
    await pool.query(query, values);
  },

  async createDeliveryJob(driverEmail, tripNumber, waypointIndex, startAddress, endAddress, startLatLon, endLatLon, estimatedDurationMinutes, distance, color) {
    const query = `
      INSERT INTO delivery_jobs (
        driver_email, trip_number, waypoint_index, start_address, end_address,
        start_lat_lon, end_lat_lon, estimated_duration_minutes, distance, color
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
      driverEmail,
      tripNumber,
      waypointIndex,
      startAddress,
      endAddress,
      startLatLon,
      endLatLon,
      estimatedDurationMinutes,
      distance,
      color
    ];
    await pool.query(query, values);
  },

  async getTripGeometryByDriverEmailAndTripNumber(driverEmail, tripNumber) {
    const query = `
      SELECT geometry FROM trip_geometries
      WHERE driver_email = $1 AND trip_number = $2
    `;
    const values = [driverEmail, tripNumber];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getDeliveryJobsByDriverEmailAndTripNumber(driverEmail, tripNumber) {
    const query = `
      SELECT * FROM delivery_jobs
      WHERE driver_email = $1 AND trip_number = $2
      ORDER BY waypoint_index
    `;
    const values = [driverEmail, tripNumber];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async updateTripGeometryStatus(driverEmail, tripNumber, status) {
    const query = `
      UPDATE trip_geometries
      SET status = $3
      WHERE driver_email = $1 AND trip_number = $2
    `;
    const values = [driverEmail, tripNumber, status];
    await pool.query(query, values);
  },
  
  async getNextDeliveryJobByDriverEmail(driverEmail) {
    const query = `
      SELECT * FROM delivery_jobs
      WHERE driver_email = $1 AND status = 'pending'
      ORDER BY trip_number, waypoint_index
      LIMIT 1
    `;
    const result = await pool.query(query, [driverEmail]);
    return result.rows[0];
  },

  

};

export default AddressModel;