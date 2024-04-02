const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/route', async (req, res) => {
  console.log("Received request: ", req.body);
  const { address } = req.body;
  try {
    console.log("Received address: ", address); // Log received address
    const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`;
    const geocodeResponse = await axios.get(geocodeURL);
    if (geocodeResponse.data.status !== 'OK') {
      throw new Error(`Geocoding failed with status: ${geocodeResponse.data.status}`);
    }
    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    // OSRM Route
    const osrmURL = `http://router.project-osrm.org/route/v1/driving/-73.5992,40.7168;${lng},${lat}?overview=full&geometries=geojson`;
    const routeResponse = await axios.get(osrmURL);
    if (routeResponse.data.code !== 'Ok') {
      throw new Error(`Routing failed with code: ${routeResponse.data.code}`);
    }
    const route = routeResponse.data.routes[0].geometry;

    res.json({ route, startPoint: { lat, lng } });
  } catch (error) {
    console.error("Error in route processing:", error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

