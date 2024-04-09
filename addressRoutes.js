const express = require("express");
const router = express.Router();
const { Pool } = require('pg');
const { pool } = require("./dbConfig"); 

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Function to convert inputted address into geo coordinates using GOOGLE geocoding API
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
      throw error;
  }
}

router.post('/api/fetch-and-group-addresses', async (req, res) =>{
  try{
    //Fetch jobs where isCompleted is false
    //console.log("Sorting started");
    const {rows} = await pool.query('SELECT * FROM job WHERE "issubmitted" = false');

    //console.log("Sample row:", rows[0]); // Debugging use

    //Group the addresses by routenumber
    const groupedAddresses = rows.reduce((acc, curr) => {
      if (!acc[curr.routenumber]) {
          acc[curr.routenumber] = [];
      }
      acc[curr.routenumber].push({id: curr.id, latLong: curr.lat_long});
      return acc;
  }, {});

    res.json(groupedAddresses);

  //console.log("Groupping by addresses with routenunmber done");
  // Process each routeNumber group sequentially
  for (const routeNumber of Object.keys(groupedAddresses)) {
      const addresses = groupedAddresses[routeNumber];
      console.log(`Processing routeNumber: ${routeNumber} with addresses:`, addresses);

      //take latlong only out of groupedAddress object
      const latLongs = groupedAddresses[routeNumber].map(item => item.latLong);
      //console.log(latLongs);
      // Convert table format to single string format for OSRM (example)
      const singleString = await OSRMdataFormat(latLongs);
      
      // Example function call - replace with actual OSRM call
      const routingResult = await callOSRMForRouting(singleString);
      
      //console.log(`Routing result for routeNumber ${routeNumber}:`, routingResult);

      var waypointIndices = await returnWaypointsIndexes(routingResult.waypoints);
      var distanceArr  = await returnDistanceArr(routingResult.trips[0]);
      var durationArr = await returnDurationArr(routingResult.trips[0]);

      //take id only out of groupedAddress object
      const id = groupedAddresses[routeNumber].map(item => item.id);
      await updateAddressIndexes(waypointIndices, distanceArr, durationArr, routeNumber, id);

      // Optionally, mark jobs as completed if necessary
  }
  } catch (error) {
    console.error('Error processing routes:', error);
    res.status(500).send('Error fetching or processing jobs');
  }
});

async function OSRMdataFormat(locations){

  const singleString = locations.map(coords => {
    // Split the coords into longitude and latitude
    const [latitude, longitude] = coords.split(',').map(coord => parseFloat(coord).toFixed(6));
    // Join them back with a comma and ensure 6 decimal places
    return `${longitude},${latitude}`;
  }).join(';');

  console.log(singleString);

  return singleString
      
}


async function updateAddressIndexes(waypointIndices, distanceArr, durationArr, routeNumber,id){
  try{

    console.log(id);

    const jobs = await pool.query(
      'SELECT * FROM job WHERE routeNumber = $1',[routeNumber]
    );

    if (jobs.rows.length !== waypointIndices.length-1 && jobs.rows.length !== distanceArr.length-1 && jobs.rows.length !== durationArr.length-1) {
      throw new Error('Mismatch between job counts and provided indexes');
  }
    else{
    for(var i = 1; i < waypointIndices.length; i++){
      const indexWaypoint = waypointIndices[i]; //Start with index 1 because index 0 will always be starting location
      //console.log("indexjob: ", indexJob);
      const indexDuration = durationArr[i-1];
      //console.log("indexDuration: ", indexDuration);
      const indexDistance = distanceArr[i-1];
      const indexId = id[i-1];
      //console.log("indexid: ",indexId);
      pool.query('UPDATE job SET waypointIndex = $1, durationseconds = $2, distance = $3, isSubmitted = true WHERE id = $4',[indexWaypoint, indexDuration, indexDistance, indexId]);
    }

    console.log('Jobs updated successfully with new indexes');
   }
  }
  catch(error){
    console.error('Error updating job indexes:', error);
  }
}

async function returnWaypointsIndexes(waypoints){
	var arr = []
	var len = waypoints.length
  //console.log(waypoints);

	for(var i = 0; i < len; i++){
	  arr.push(waypoints[i].waypoint_index);
	}
  console.log("waypoints: ",arr);
	return arr;
}


async function returnDistanceArr(trip){
  var arr = []
  //console.log(trip.legs[0]);
  var len = trip.legs.length;
  //console.log(trip.legs);

  for(var i = 0; i<len; i++){
    arr.push(trip.legs[i].distance);
  }
  console.log("distance: ",arr);
  return arr;
}

async function returnDurationArr(trip){
  var arr = []
  var len = trip.legs.length;
  //console.log(trip.legs);

  for(var i = 0; i<len; i++){
    arr.push(trip.legs[i].duration);
  }

  console.log("duration: ",arr);
  return arr;
}

async function callOSRMForRouting(locations) {
  const osrmBaseUrl = 'http://router.project-osrm.org/trip/v1/driving/-73.5992,40.7168;';
  const osrmRequestUrl = '?source=first&roundtrip=false&geometries=geojson';

  try {
      console.log(osrmBaseUrl + locations + osrmRequestUrl);
      const response = await fetch(osrmBaseUrl + locations + osrmRequestUrl); 
      const data = await response.json();
      console.log("Everything worked");
      //console.log("OSRM Response Data:", data);
      console.log("Duration in mins: " + data.trips[0].duration /60);

      return data; // The OSRM routing result
  } catch (error) {
      console.error('Error calling OSRM:', error);
      throw error; 
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
          driverName: "Driver", // TO CHANGE IF REQUIRMENTS CHANGE
          routeNumber: result, //uses function getNextRouteNumber()
          waypointIndex: 0, // default index
          latLong: row.lat_long,
          realAddress: row.realaddress,
          startDate: new Date(), // Placeholder - TO CHANGE
          formattedDuration: "seconds",
          durationSeconds: 0,
          isCompleted: false, // default
          isStartOfRoute: false, // default
          routeStarted: false, // default
          issubmitted: false,
      };
        const {driverName, routeNumber, waypointIndex, latLong, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted, issubmitted} = jobDetails;

        await pool.query('INSERT INTO job (driverName, routeNumber, waypointIndex, lat_long, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted, isSubmitted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', 
            [driverName, routeNumber, waypointIndex,
                 latLong, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, 
                 isStartOfRoute, routeStarted, issubmitted]);
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
          routeNumber: result, //uses function getNextRouteNumber()
          waypointIndex: 0, // default
          latLong: latLong,
          realAddress: realAddress,
          startDate: new Date(), // Placeholder - TO CHANGE
          formattedDuration: "seconds", // default
          durationSeconds: 0, // default
          isCompleted: false, // default
          isStartOfRoute: false, // default
          routeStarted: false, // default
          isSubmitted: false,
      };
  
      await pool.query('INSERT INTO job (driverName, routeNumber, waypointIndex, lat_long, realAddress, startDate, formattedDuration, durationSeconds, isCompleted, isStartOfRoute, routeStarted, issubmitted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [jobDetails.driverName, jobDetails.routeNumber, jobDetails.waypointIndex, jobDetails.latLong, jobDetails.realAddress, 
            jobDetails.startDate, jobDetails.formattedDuration, jobDetails.durationSeconds, 
            jobDetails.isCompleted, jobDetails.isStartOfRoute, jobDetails.routeStarted, jobDetails.isSubmitted]);
  

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

  
  res.send({ message: 'Addresses processed, ready for routing!' }); //This is sent back to frontend
 


});

module.exports = router;