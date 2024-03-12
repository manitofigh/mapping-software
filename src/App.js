import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';

function Geocoding() {
  const [addresses, setAddresses] = useState([]);
  const [results, setResults] = useState([]);

  const geocodeAddresses = async () => {
    const geocodedResults = [];

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];

      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyBIEXaswR68t2n5B34h_FEtp585wbVnGIQ`);
        const data = await response.json();

        if (data.status === 'OK') {
          const result = data.results[0];
          const geocodedResult = {
            formatted_address: result.formatted_address,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
            accuracy: result.geometry.location_type,
            google_place_id: result.place_id,
            type: result.types.join(','),
            postcode: result.address_components.find(component => component.types.includes('postal_code')).long_name
          };
          geocodedResults.push(geocodedResult);
        } else {
          console.error(`Error geocoding ${address}: ${data.status}`);
        }
      } catch (error) {
        console.error(`Error geocoding ${address}: ${error}`);
      }
    }

    setResults(geocodedResults);

    // Save the results to a JSON file
    console.log(geocodedResults);
    //saveResultsToJsonFile(geocodedResults, 'geocoding_results.json');
  };

  const saveResultsToJsonFile = (results, filename) => {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <textarea
        placeholder="Enter addresses separated by commas"
        rows="5"
        cols="50"
        value={addresses.join('\n')}
        onChange={(e) => setAddresses(e.target.value.split('\n'))}
      />
      <button onClick={geocodeAddresses}>Geocode Addresses</button>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <strong>Address:</strong> {result.formatted_address}<br />
            <strong>Latitude:</strong> {result.latitude}<br />
            <strong>Longitude:</strong> {result.longitude}<br />
            <strong>Accuracy:</strong> {result.accuracy}<br />
            <strong>Google Place ID:</strong> {result.google_place_id}<br />
            <strong>Type:</strong> {result.type}<br />
            <strong>Postcode:</strong> {result.postcode}<br />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Geocoding;
