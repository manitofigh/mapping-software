const express = require("express");
const router = express.Router();
const { pool } = require("./dbConfig"); 

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

async function geocodeAddress(address) {
    // This function should call the geocoding API and return the { latitude, longitude }
    // For demonstration, it returns a mock value
    return { latitude: "40.712776", longitude: "-74.005974", realAddress: "temp_realaddress" }; // Example coordinates for New York City
  }
  
router.post('/api/addresses', async (req, res) => {
    const inputAddress = req.body.addresses; // Assuming this is an array of address strings
    let tempAddresses = [];
  
    for (let address of inputAddress) {
      try {
        // Query to check if the address exists in the database
      const queryResult = await pool.query('SELECT * FROM addresses WHERE address = $1', [address]);
      
      if (queryResult.rows.length > 0) {
        console.log("Address found in database:", address);
        const jobDetails = {
            driverName: "Driver A", // Example, replace with actual logic to determine
            routeNumber: 1, // Example
            waypointIndex: 0, // Example, you might need to determine this based on other data
            latLong: queryResult.rows[0].lat_long,
            realAddress: queryResult.rows[0].realaddress,
            startDate: new Date(), // Example, replace with actual logic
            formattedDuration: "1 hour", // Example
            durationSeconds: 3600, // example
            isCompleted: false,
            isStartOfRoute: false, // default
            routeStarted: false, // default
            invalidAddress: false // default
        };
        const {driverName, routeNumber, waypointIndex, latLong, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted, invalidAddress} = jobDetails;

        await pool.query('INSERT INTO job (driverName, routeNumber, waypointIndex, lat_long, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted, invalidAddress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', 
            [driverName, routeNumber, waypointIndex,
                 latLong, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, 
                 isStartOfRoute, routeStarted, invalidAddress]);
      }  else {
        // The address does not exist, add it to tempAddresses for further processing
        tempAddresses.push(address);
        }
    } catch (error) {
      console.error("Error executing query:", error);
      return res.status(500).send("Server Error");
  }
    }
  
    // Geocode tempAddresses here and save them in the database
    for (let address of tempAddresses) {
      const { latitude, longitude, realAddress } = await geocodeAddress(address);
      const latLong = `${latitude},${longitude}`;
  
      await pool.query('INSERT INTO addresses (address, realAddress, lat_long) VALUES ($1, $2, $3)', [address,realAddress, latLong]);
    }
  
    res.send({ message: 'Addresses processed' });
  });
  
app.use('/', router);
module.exports = router;


const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
