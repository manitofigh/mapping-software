const express = require("express");
const router = express.Router();
const { pool } = require("./dbConfig"); 

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies


async function geocodeAddress(addresses) {

  const apiKey = process.env.GEOCODING_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addresses)}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK') {
    const result = data.results[0];
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      realAddress: result.formatted_address
    };
  } else {
    // Handle error or non-OK status as needed
    throw new Error(`Geocoding failed for ${address}: ${data.status}`);
  }

}

  
router.post('/api/addresses', async (req, res) => {
    const inputAddress = req.body.addresses; // array of addresses recieved
    let tempAddresses = [];
  
    for (let address of inputAddress) {
      try {
        // Query to check if the address exists in the database
      const queryResult = await pool.query('SELECT * FROM addresses WHERE address = $1', [address]);
      
      if (queryResult.rows.length > 0) {
        console.log("Address found in database:", address);
        const jobDetails = {
          driverName: "Driver A", // Placeholder - TO CHANGE
          routeNumber: 1, // Placeholder - TO CHANGE
          waypointIndex: 0, // Placeholder - TO CHANGE
          latLong: latLong,
          realAddress: realAddress,
          startDate: new Date(), // Placeholder - TO CHANGE
          formattedDuration: "seconds", // Placeholder - TO CHANGE
          durationSeconds: 3600, // Placeholder - TO CHANGE
          isCompleted: false, // default
          isStartOfRoute: false, // default
          routeStarted: false, // default
      };
        const {driverName, routeNumber, waypointIndex, latLong, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted} = jobDetails;

        await pool.query('INSERT INTO job (driverName, routeNumber, waypointIndex, lat_long, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', 
            [driverName, routeNumber, waypointIndex,
                 latLong, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, 
                 isStartOfRoute, routeStarted]);
      }  else {
        // The address does not exist, add it to tempAddresses to send to google API
        tempAddresses.push(address);
        }
    } catch (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Server Error");
  }
    }
  
    // Geocode tempAddresses here and save them in the database
    for (let address of tempAddresses) {
      try{
      console.log("Geocoding - ", address);
      const { latitude, longitude, realAddress } = await geocodeAddress(address);
      const latLong = `${latitude},${longitude}`;
  
      await pool.query('INSERT INTO addresses (address, realAddress, lat_long, isvalid) VALUES ($1, $2, $3, $4)', [address, realAddress, latLong, true]);
      
      const jobDetails = {
        driverName: "Driver A", // Placeholder - TO CHANGE
        routeNumber: 1, // Placeholder - TO CHANGE
        waypointIndex: 0, // Placeholder - TO CHANGE
        latLong: latLong,
        realAddress: realAddress,
        startDate: new Date(), // Placeholder - TO CHANGE
        formattedDuration: "seconds", // Placeholder - TO CHANGE
        durationSeconds: 3600, // Placeholder - TO CHANGE
        isCompleted: false, // default
        isStartOfRoute: false, // default
        routeStarted: false, // default
    };

    await pool.query('INSERT INTO job (driverName, routeNumber, waypointIndex, lat_long, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [jobDetails.driverName, jobDetails.routeNumber, jobDetails.waypointIndex, jobDetails.latLong, jobDetails.realAddress, 
          jobDetails.startDate, jobDetails.formattedDuration, jobDetails.durationSeconds, 
          jobDetails.isCompleted, jobDetails.isStartOfRoute, jobDetails.routeStarted]);

    }
    catch (error) {
      console.error("Error geocoding address:", error);
      await pool.query(
        'INSERT INTO addresses (address, isValid) VALUES ($1, $2,)',
        [address, false]
    );
    }
  };
  
  res.send({ message: 'Addresses processed' });

});

module.exports = router;