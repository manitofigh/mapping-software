import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';

function Geocoding() {
  const [addresses, setAddresses] = useState(['']);
  const [results, setResults] = useState([]);

 // Allows input to appear as it is to make it one string to use the \n to split the code.   
  const handleAddressChange = (e, index) => {
    const newAddresses = [...addresses];
    newAddresses[index] = e.target.value;
    setAddresses(newAddresses);
  };

  const addAddressInput = () => {
    setAddresses([...addresses, '']);
  };

  const removeAddressInput = (index) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    setAddresses(newAddresses);
  };

  const concatenateAddresses = () => {
    const concatenatedAddresses = addresses.join('\n');
    console.log(concatenatedAddresses);
    
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
  const dragOverHandler = ev => {
 
    // console.log("dragOvered");
    ev.target.background = "blue"
    ev.preventDefault();
  }
  const dropHandler = ev => {  
    // console.log("hello");
    ev.preventDefault();
    if(ev.target.classList.contains("dragover"))
      ev.target.classList.remove("dragover");
  }

  const dragEnter = ev => {  
  
     console.log("dragEnter");
    if(ev.target.id == "drop_zone")
      ev.target.classList.add("dragover");
  }
  const dragLeave = ev => {  
  
    // console.log("dragLeave");
    if(ev.target.id == "drop_zone")
      ev.target.classList.remove("dragover");
  }


  
  return (
    <div>
      {addresses.map((address, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => handleAddressChange(e, index)}
          />
          <button onClick={() => removeAddressInput(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addAddressInput}>Add Address</button>
      <button onClick={doneInputting}>Done Inputting</button>
      {/* File Upload Section */}
      <div 
        id="drop_zone"
        onDrop={e => dropHandler(e)}
        onDragOver={e => dragOverHandler(e)}
        onDragEnter={e => dragEnter(e)}
        onDragLeave={e => dragLeave(e)}
      >
        <p>Drag a text file in this area</p>
        <form>
          <input type="file" id="actual_button" accept=".csv,.txt" hidden />
          <label id="upload_label" htmlFor="actual_button">Upload File</label>
        </form>
      </div>
    </div>
  );
  
}

export default Geocoding;
