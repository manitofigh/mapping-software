import '../assets/css/style.css';
import React, { useState, useEffect } from 'react';

function Geocoding({childToParent}) {
  const [addresses, setAddresses] = useState([""]);
 
  const [results, setResults] = useState([]);

  // const [data, setData] = useState({});

  /*useEffect(() => {
    console.log("Data Setup");
    console.log(data);
    return () => {
    	console.log("Data Changed");
	console.log(data);
    }
  },data);*/

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

  

  const geocodeAddresses = async (concatenatedAddresses) => {

    // Create a blob from the text string
    const blob = new Blob([concatenatedAddresses], { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', blob);

    const geocodedResults = [];
    try {
        const response = await fetch('http://localhost:3000/api/uploadaddresses', {
            method: 'POST',
            body: formData
        });
        const textResponse = await response.text();

        if (response.ok) {
          console.log("Success:", textResponse);
          geocodedResults.push(textResponse);
        } else {
          console.error('Error from backend:', textResponse);
        }
    } catch (error) {
        console.error('Network error:', error);
    }

    setResults(geocodedResults);
    console.log(geocodedResults);
};

  const doneInputting = () => {
    const concatenatedAddresses = addresses.join('\n');
    console.log(concatenatedAddresses);
    geocodeAddresses(concatenatedAddresses); // Geocode all addresses
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

  const addressSort = async () => {	
    try {
      const response = await fetch('http://localhost:3000/api/fetch-and-group-addresses',{
        method: 'POST'
      });
      const textResponse = await response.text();

    if (response.ok) {
      console.log("Success:", textResponse);
      setTimeout(async () => {
        const tripsData = await fetchgeometry();
        const itineraryData = await fetchitineary();
        const pinpoints = await fetchpinpoints(); 

        childToParent(tripsData,itineraryData,pinpoints);
    }, 3000); //3 second delay to allow db to process and store data before being called again


    } else {
      console.error('Error from backend:', textResponse);
    }
    
    } catch (error) {
        console.error('Network error:', error);
    }
  }

  var fetchpinpoints = async () => {
    try {
      const data = await fetch('http://localhost:3000/api/get-pinpoints', {
        method: 'POST',
      });
      const pinpoints = await data.json(); // Assuming JSON response for simplicity
      

      if (data.ok) {
          console.log("Second fetch successful:", pinpoints);
          return pinpoints
      } else {
          console.error('Error in second fetch:', pinpoints);
      }
    } catch (error) {
      console.error('Error during second fetch:', error);
      }
  }

  const fetchitineary = async () => {
    try {
        const data = await fetch('http://localhost:3000/api/get-itineray', {
          method: 'POST',
        });
        const itineraryData = await data.json(); // Assuming JSON response for simplicity
        

        if (data.ok) {
            //console.log("Second fetch successful:", itineraryData);
            return itineraryData
        } else {
            console.error('Error in second fetch:', itineraryData);
        }
    } catch (error) {
        console.error('Error during second fetch:', error);
    }
}

  const fetchgeometry = async () => {
    try {
        const geometry = await fetch('http://localhost:3000/api/get-route-geometry', {
          method: 'POST',
        });
        const Tripsdata = await geometry.json(); // Assuming JSON response for simplicity
        

        if (geometry.ok) {
            console.log("Second fetch successful:", Tripsdata);
            return Tripsdata
        } else {
            console.error('Error in second fetch:', Tripsdata);
        }
    } catch (error) {
        console.error('Error during second fetch:', error);
    }
}


  return (
    <div class="right_sidebar">
      {addresses.map((address, index) => (
        <div class="input_bar" key={index}>
          <input
            type="text"
            placeholder="Enter address"
	    class = "input_box"
            value={address}
            onChange={(e) => setAddresses([...addresses.slice(0, index), e.target.value, ...addresses.slice(index + 1)])}
          />
          <button class="remove_button" onClick={() => setAddresses(addresses.filter((_, i) => i !== index))}>X</button>
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

      <button onClick={addressSort}>Run Address Sorting</button>
    </div>
  );
}

export default Geocoding;