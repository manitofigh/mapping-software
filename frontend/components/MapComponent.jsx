import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent() {
  const [address, setAddress] = useState('');
  // Removed the unused 'route' state and kept 'routeGeometry' for the route drawing
  const [startPoint, setStartPoint] = useState([40.7169, -73.5990]); // Default to Hofstra University's coordinates
  const [routeGeometry, setRouteGeometry] = useState(null); // Store route geometry data here

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending to backend:" + JSON.stringify({ address }));
    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Received from backend: ", data);
      
      // Assuming 'data.route' is the GeoJSON geometry object returned from OSRM via your backend
      setRouteGeometry(data.route.coordinates); // Store the route coordinates for drawing
      setStartPoint([data.startPoint.lat, data.startPoint.lng]); // Update the starting point to the new location
    } catch (error) {
      console.error("Error fetching the route:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter an address"
        />
        <button type="submit">Get Route - Starting at Hofstra</button>
      </form>
      <MapContainer center={startPoint} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={startPoint} />
        {routeGeometry && (
          // Draw the polyline based on the route geometry; assume coordinates are [lng, lat] and need reversing
          <Polyline pathOptions={{ color: 'blue' }} positions={routeGeometry.map(([lng, lat]) => [lat, lng])} />
        )}
      </MapContainer>
    </div>
  );
}

export default MapComponent;