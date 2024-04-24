const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
const { Pool } = require('pg');
const { pool } = require("./dbConfig"); 
const fs = require('fs');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.text());
app.use(bodyParser.json());

const outputDirectory = path.join(__dirname, 'routes'); // FIX PLS

async function getRouteGeometry(routenumber){
    try {
        const query = `
            SELECT routenumber, ST_AsGeoJSON(route_geometry) AS geometry
            FROM routes
            WHERE routenumber = $1;`;
        
        const values = [routenumber];
        const { rows } = await pool.query(query, values);
        
        if (rows.length > 0) {
            console.log(`Retrieved Route Geometry for routenumber: ${rows[0].routenumber}`);
            // Convert the geometry from a JSON string to an object
            const geometry = JSON.parse(rows[0].geometry);
            console.log(geometry);
            return geometry; 
        } else {
            console.log(`Route with routenumber: ${routenumber} does not exist.`);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving route geometry:', error);
        throw error; // or return null; depending on how you want to handle errors
    }
}


router.post('/api/get-route-geometry', async (req, res) => {
    try {
        // First, find the highest routenumber in the database
        const findHighestRouteNumberQuery = `
            SELECT MAX(routenumber) AS routenumber
            FROM job
            WHERE routestarted = false;
        `;
        const highestRouteResult = await pool.query(findHighestRouteNumberQuery);

        if (highestRouteResult.rows.length === 0 || highestRouteResult.rows[0].routenumber === null) {
            return res.status(404).send({ error: 'No active routes found in the database.' });
        }

        const routenumber = highestRouteResult.rows[0].routenumber;

        // Fetch the geometry for the highest routenumber
        const geometry = await getRouteGeometry(routenumber);
        if (geometry) {
            res.send({ routenumber, geometry }); // This is sent to frontend, for debugging
        } else {
            res.status(404).send({ error: `Route with routenumber: ${routenumber} does not exist.` });
        }
    } catch (error) {
        console.error('Failed to retrieve route geometry:', error);
        res.status(500).send({ error: 'Failed to retrieve route geometry' });
    }
});

router.post('/api/get-itineray', async (req, res) => { //NEED TO CHANGE TO RECIEVING A ROUTE NUMBER TO DISPLAY ITINERY
    try {
        // Find the next routenumber where isStarted is false
        const routeQuery = `
            SELECT routenumber
            FROM job
            WHERE routestarted = false
            ORDER BY routenumber DESC
            LIMIT 1;
        `;
        const routeResult = await pool.query(routeQuery);

        if (routeResult.rows.length === 0) {
            return res.status(404).send({ message: "No unstarted routes found." });
        }

        const routenumber = routeResult.rows[0].routenumber;

        // Fetch waypoints for the determined routenumber
        const waypointsQuery = `
            SELECT *
            FROM job
            WHERE routenumber = $1
            ORDER BY waypointindex;
        `;
        const { rows } = await pool.query(waypointsQuery, [routenumber]);

        if (rows.length === 0) {
            return res.status(404).send({ message: "No waypoints found for the route." });
        }

        // Process rows to group them by consecutive waypoints
        const results = [];
        for (let i = 0; i < rows.length - 1; i ++) {
            const current = rows[i];
            const next = rows[i + 1];
            results.push({
                "Start_Time": current.startdate,
                "Location_1": current.realaddress,
                "Location_2": next ? next.realaddress : 'N/A',  // Handle odd number of locations
                "Duration": current.durationseconds,
                "Formatted_Time": current.formattedduration
            });
        }

        // Convert results to a JSON string
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(results, null, 4)); // Indent with 4 spaces
    } catch (error) {
        console.error('Failed to retrieve data:', error);
        res.status(500).send({ error: 'Failed to retrieve data' });
    }
});



module.exports = router;
