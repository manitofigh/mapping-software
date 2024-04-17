const express = require("express");
const router = express.Router();
const { Pool } = require('pg');
const { pool } = require("./dbConfig"); 

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.text());

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
            return geometry; // or rows[0] if you want the routenumber and geometry together
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
    //console.log(req.body);
    const routenumber = parseInt(req.body.routenumber, 10);
    //console.log(routenumber);
    if (isNaN(routenumber)) {
        return res.status(400).send({ error: 'routenumber must be an integer....' });
    }

    try {
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

module.exports = router;
