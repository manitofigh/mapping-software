import pool from '../utils/db.js';

const AddressModel = {
  async getGeocodedLocation(address) {
    const query = `
      SELECT * 
      FROM geocoded_locations 
      WHERE address = $1
    `;
    const result = await pool.query(query, [address]);
    return result.rows[0];
  },

  async addGeocodedLocation(address, latLon, realAddress, quality) {
    const query = `
      INSERT INTO geocoded_locations 
      (address, lat_lon, real_address, quality) 
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [address, latLon, realAddress, quality]);
  },

  async addDeliveryLocation(address, latLon, driverEmail, color, status, createdAt) {
    const query = `
      INSERT INTO delivery_locations 
      (address, lat_lon, driver_email, color, status, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(query, [address, latLon, driverEmail, color, status, createdAt]);
  },

  async getDeliveryLocationByLatLonAndDriverEmail(latLon, driverEmail) {
    const query = `
      SELECT * 
      FROM delivery_locations 
      WHERE lat_lon = $1 
      AND driver_email = $2
    `;
    const result = await pool.query(query, [latLon, driverEmail]);
    return result.rows[0];
  },

  async getDeliveryLocationsByDriverEmail(driverEmail) {
    const query = `
      SELECT * 
      FROM delivery_locations 
      WHERE driver_email = $1 
      AND status = $2
    `;
    const result = await pool.query(query, [driverEmail, 'pending']);
    return result.rows;
  },

  async getPendingDeliveryLocations() {
    const query = `
      SELECT address, driver_email, created_at, lat_lon, color 
      FROM delivery_locations 
      WHERE status = $1
    `;
    const values = ['pending'];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getPendingAndAssignedDeliveryLocations() {
    const query = `
      SELECT address, driver_email, created_at, lat_lon, color 
      FROM delivery_locations 
      WHERE status = $1 
      OR status = $2
    `;
    const values = ['pending', 'assigned'];
    const result = await pool.query(query, values);
    return result.rows;
  },

async getAssignedDeliveryLocationsByEmail(driverEmail) {
    const query = `
        SELECT address, lat_lon, color 
        FROM delivery_locations 
        WHERE status = $1 
        AND driver_email = $2
    `;
    const values = ['assigned', driverEmail];
    const result = await pool.query(query, values);
    return result.rows;
},
  
  async updateDeliveryLocationStatus(address, driverEmail, status) {
    const query = `
      UPDATE delivery_locations 
      SET status = $1 
      WHERE address = $2 
      AND driver_email = $3
    `;
    const values = [status, address, driverEmail];
    await pool.query(query, values);
  },

  async updateDeliveryJobStatus(id, status) {
    const query = `
      UPDATE delivery_jobs 
      SET status = $1 
      WHERE id = $2
    `;
    const values = [status, id];
    await pool.query(query, values);
  },

  async getPendingDeliveryLocationsByDriverEmail(driverEmail) {
    const query = `
      SELECT * 
      FROM delivery_locations 
      WHERE driver_email = $1 
      AND status = $2
    `;
    const result = await pool.query(query, [driverEmail, 'pending']);
    return result.rows;
  },

  async getDeliveryJobsByDriverEmailAndTripNumber(driverEmail, tripNumber) {
    const query = `
      SELECT * 
      FROM delivery_jobs 
      WHERE driver_email = $1 
      AND trip_number = $2 
      ORDER BY waypoint_index
    `;
    const values = [driverEmail, tripNumber];
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getHighestTripNumberByDriverEmail(driverEmail) {
    const query = `
      SELECT MAX(trip_number) AS highest_trip_number
      FROM trip_geometries
      WHERE driver_email = $1 AND status = 'completed'
    `;
    const result = await pool.query(query, [driverEmail]);
    return result.rows[0].highest_trip_number;
  },

  async getHighestPendingTripNumberByDriverEmail(driverEmail) {
    const query = `
      SELECT MAX(trip_number) AS highest_trip_number 
      FROM trip_geometries 
      WHERE driver_email = $1 
      AND status = $2
    `;
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

  async getRouteGeometries() {
    const query = `
      SELECT geometry, color 
      FROM trip_geometries 
      WHERE status = $1
    `;
    const values = ['pending'];
    const result = await pool.query(query, values);
    return result.rows;
  },
  async getRouteGeometriesByEmail(driverEmail) {
    const query = 'SELECT geometry, color FROM trip_geometries WHERE driver_email = $1';
    const values = [driverEmail];
    const result = await pool.query(query, values);
    //console.log(result.rows[0]);
    return result.rows[0];
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
      SELECT geometry, color 
      FROM trip_geometries 
      WHERE driver_email = $1 
      AND trip_number = $2
    `;
    const values = [driverEmail, tripNumber];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getDeliveryJobsByDriverEmailAndTripNumber(driverEmail, tripNumber) {
    const query = `
      SELECT * 
      FROM delivery_jobs
      WHERE driver_email = $1 
      AND trip_number = $2
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
      WHERE driver_email = $1 
      AND trip_number = $2
    `;
    const values = [driverEmail, tripNumber, status];
    await pool.query(query, values);
  },
  
  async getNextDeliveryJobByDriverEmail(driverEmail) {
    const query = `
      SELECT * 
      FROM delivery_jobs
      WHERE driver_email = $1 
      AND status = 'pending'
      ORDER BY trip_number, waypoint_index
      LIMIT 1
    `;
    const result = await pool.query(query, [driverEmail]);
    return result.rows[0];
  },

  async getActiveTrip(driverEmail) {
    const query = `
      SELECT 
        dj.driver_email,
        dj.trip_number,
        dj.waypoint_index,
        dj.start_address,
        dj.end_address,
        dj.estimated_duration_minutes,
        dj.distance,
        dj.status,
        dj.start_time,
        dj.end_time,
        dj.actual_duration_minutes,
        dj.color
      FROM delivery_jobs dj
      JOIN (
        SELECT driver_email, MAX(trip_number) AS max_trip_number
        FROM delivery_jobs
        WHERE driver_email = $1 AND status != 'completed'
        GROUP BY driver_email
      ) latest_trip ON dj.driver_email = latest_trip.driver_email AND dj.trip_number = latest_trip.max_trip_number
      ORDER BY dj.waypoint_index;
    `;
  
    const values = [driverEmail];
    const result = await pool.query(query, values);
  
    if (result.rows.length === 0) {
      return null;
    }
  
    return {
      driverEmail: result.rows[0].driver_email,
      deliveryJobs: result.rows
    };
  },
  
  async updateRouteStatus(driverEmail, tripNumber, waypointIndex, status) {
    const query = `
      UPDATE delivery_jobs
      SET status = $1
      WHERE driver_email = $2
      AND trip_number = $3
      AND waypoint_index = $4
    `;
    const values = [status, driverEmail, tripNumber, waypointIndex];
    await pool.query(query, values);
  },
  
  async updateTripStatus(driverEmail, tripNumber, status) {
    const query = `
      UPDATE trip_geometries
      SET status = $1
      WHERE driver_email = $2
      AND trip_number = $3
    `;
    const values = [status, driverEmail, tripNumber];
    await pool.query(query, values);
  },

  
  async stampStartTime(driverEmail, tripNumber, waypointIndex, startTime) {
    const query = `
      UPDATE delivery_jobs
      SET start_time = $1
      WHERE driver_email = $2
      AND trip_number = $3
      AND waypoint_index = $4
    `;
    const values = [startTime, driverEmail, tripNumber, waypointIndex];
    await pool.query(query, values);
  },
  
  async stampEndTime(driverEmail, tripNumber, waypointIndex, endTime) {
    const query = `
      UPDATE delivery_jobs
      SET end_time = $1
      WHERE driver_email = $2
      AND trip_number = $3
      AND waypoint_index = $4
    `;
    const values = [endTime, driverEmail, tripNumber, waypointIndex];
    await pool.query(query, values);
  },

  async getCompletedTripNumbers(driverEmail) {
    const query = `
      SELECT DISTINCT trip_number
      FROM trip_geometries
      WHERE driver_email = $1 AND status = 'completed'
      ORDER BY trip_number DESC;
    `;
    const values = [driverEmail];
    const result = await pool.query(query, values);
    return result.rows.map(row => row.trip_number);
  },
  
  async getDeliveryJobsByTripNumber(driverEmail, tripNumber) {
    const query = `
      SELECT *
      FROM delivery_jobs
      WHERE driver_email = $1 AND trip_number = $2
      ORDER BY waypoint_index;
    `;
    const values = [driverEmail, tripNumber];
    const result = await pool.query(query, values);
    return result.rows;
  },

};

export default AddressModel;