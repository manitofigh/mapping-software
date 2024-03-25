
import './App.css';
import React, { useState } from 'react';

function Geocoding() {
  const [addresses, setAddresses] = useState([""]);
  const [addresses, setAddresses] = useState([""]);
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      let resultText = e.target.result;
      resultText = resultText.replaceAll('\r', '');
      const texts = resultText.split('\n');
      texts.pop();
  
      setAddresses(texts.slice(0, 100)); 
    };
    if (file) {
      reader.readAsText(file);
    }
  };

  const addAddressInput = () => {
    if (addresses.length < 100) {
      setAddresses([...addresses, '']);
    }
  };

  

  

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

  const doneInputting = () => {
    const concatenatedAddresses = addresses.join('\n');
    console.log(concatenatedAddresses);
    geocodeAddresses(); // Geocode all addresses
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

  const dragOverHandler = (e) => {
    e.preventDefault();
    e.target.classList.add("dragover");
  };
  
  const dragEnterHandler = (e) => {
    e.preventDefault();
    e.target.classList.add("dragover");
  };
  
  const dragLeaveHandler = (e) => {
    e.preventDefault();
    e.target.classList.remove("dragover");
  };

  const dropHandler = (e) => {
    e.preventDefault();
    e.target.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  return (
    <div>
      {addresses.map((address, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddresses([...addresses.slice(0, index), e.target.value, ...addresses.slice(index + 1)])}
          />
          <button onClick={() => setAddresses(addresses.filter((_, i) => i !== index))}>Remove</button>
        </div>
      ))}
      <button onClick={addAddressInput}>Add Address</button>
      <button onClick={doneInputting}>Done Inputting</button>
      
      <div
        id="drop_zone"
        onDrop={dropHandler}
        onDragOver={dragOverHandler}
        onDragEnter={dragEnterHandler}
        onDragLeave={dragLeaveHandler}
      >
        <label htmlFor="actual_button" id="upload_label">Upload File</label>
        <input type="file" id="actual_button" accept=".csv,.txt" onChange={handleFileChange} hidden />
      </div>
    </div>
  );
}

export default Geocoding;