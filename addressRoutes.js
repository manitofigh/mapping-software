const express = require("express");
const router = express.Router();
const { pool } = require("./dbConfig"); 

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies


async function geocodeAddress(addresses) {

  const apiKey = process.env.GEOCODING_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addresses)}&key=${apiKey}`;

  try {
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
    // The geocoding API returned a status other than 'OK'
      console.log(`Geocoding API returned status ${data.status} for address: ${addresses}`);
      return undefined;
    }
  } catch (fetchError) {
    // This catch block handles exceptions thrown from the fetch operation
    console.error("Error fetching geocoding API:", fetchError);
    return undefined;
  }
}

// Function to get the highest routeNumber from the job table
async function getNextRouteNumber() {
  try {
      // Query to find the highest routeNumber in the job table
      const result = await pool.query('SELECT MAX(routenumber) as routenumber FROM job');
      const maxRouteNumber = result.rows[0].routenumber;
      console.log("MAXROUTENUMBER",maxRouteNumber);

      // If no routeNumbers exist yet, start with 1, otherwise increment by 1
      return maxRouteNumber ? maxRouteNumber + 1 : 1;
  } catch (error) {
      console.error("Error fetching max routeNumber:", error);
      throw error; // Rethrow or handle as appropriate
  }
}


  
router.post('/api/addresses', async (req, res) => {
    const inputAddress = req.body.addresses; // array of addresses recieved
    let tempAddresses = [];
    const result = await getNextRouteNumber();
    for (let address of inputAddress) {
      try {
        // Query to check if the address exists in the database
      const queryResult = await pool.query('SELECT * FROM addresses WHERE address = $1', [address]);
      //console.log(address," and ", queryResult);
      
      if (queryResult.rows.length > 0) {

        const row = queryResult.rows[0]; // Access the first row

        if (row.isvalid) {
        console.log("Address found in database:", address);
        const jobDetails = {
          driverName: "Driver A", // Placeholder - TO CHANGE
          routeNumber: result, //uses function getNextRouteNumber()
          waypointIndex: 0, // Placeholder - TO CHANGE
          latLong: row.lat_long,
          realAddress: row.realaddress,
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
      }}  else {
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
      const geocodeResult = await geocodeAddress(address);
      
      console.log(geocodeResult);
      if(geocodeResult && geocodeResult.latitude !== 'undefined'){
        const { latitude, longitude, realAddress } = geocodeResult;
        const latLong = `${latitude},${longitude}`;

        await pool.query('INSERT INTO addresses (address, realAddress, lat_long, isvalid) VALUES ($1, $2, $3, $4)', [address, realAddress, latLong, true]);
      
        const jobDetails = {
          driverName: "Driver", // TO CHANGE IF REQUIRMENTS CHANGE
          routeNumber: result, // Placeholder - TO CHANGE
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
      else{
      try{
        await pool.query('INSERT INTO addresses (address, isValid) VALUES ($1, $2) ON CONFLICT (address) DO NOTHING', [address, false]);
      } catch (dbError) {
        // Handle errors from the database operation
        console.error("Error inserting invalid address into database:", dbError);
        }
      }
    }
    catch (error) {
      console.error(`An error occurred while processing address: ${address}. Error: ${error.message}`);
      
    }
    }

  
  res.send({ message: 'Addresses processed' }); //This is sent back to frontend

});

module.exports = router;