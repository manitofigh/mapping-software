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

  const addressSort = async () => {	
    // console.log("Running Address Sorting");
    var str = ""
    results.forEach(e => {
      str += e['longitude'];
      str += ","
      str += e['latitude'];
      str += ";"
    });
    var res = str.substring(0,str.length-1);
    console.log(res);


    try {
      const response = await fetch("http://router.project-osrm.org/trip/v1/driving/" + res + "?source=first&roundtrip=false&geometries=geojson");
      const data = await response.json();
      if(data.code === "Ok"){
        // console.log("Everything worked")
        // console.log("Duration in mins: " + data.trips[0].duration / 60)
        
	var dat = []
        var waypointIndices = returnWaypointsIndexes(data.waypoints)
        
	// Logs the Addresses
	var currentDate = new Date();
        for(var i = 1; i < results.length; i++){
	  var leg = {}
  	  leg["start_time"] = 0;
	  if(i == 1)
	  	leg["start_time"] = currentDate.getTime() + convertSecondsToMiliseconds(3600);
	  else
	  	leg["start_time"] = dat[dat.length-1]["start_time"] + convertSecondsToMiliseconds(dat[dat.length-1]["duration"]) + convertSecondsToMiliseconds(1);
	  leg["location1"] = results[waypointIndices[i-1]]['formatted_address']
	  leg["location2"] = results[waypointIndices[i]]['formatted_address']
	  leg["duration"] = data.trips[0].legs[i-1].duration;
	  leg["formatted_time"] = convertsSecondsToTime(leg["duration"]);
	  dat.push(leg);

          //console.log(results[waypointIndices[i-1]]['formatted_address'] + "\tto\t"  + results[waypointIndices[i]]['formatted_address'] + ": " + convertsSecondsToTime(data.trips[0].legs[i-1].duration));
          // console.log(data.trips[0].legs[i-1].duration);
         }
	 // console.log(dat);
	 // console.log("Child To Parent");
	 childToParent(data,dat);
        //console.log(data)
      } else 
        console.error(data.code + ": " + data.message);
      } catch (error) {
        console.error(`Error address sorting`);
    }

    function convertSecondsToMiliseconds(seconds){
	return seconds * 1000;
    }

    function returnWaypointsIndexes(waypoints){
      var arr = []
      var len = waypoints.length
      for(var i = 0; i < len; i++){
        for(var a = 0; a < len; a++){
          if(waypoints[a].waypoint_index == i){
            arr.push(a);
          }
        }
      }
      return arr;
    
         }

    function convertsSecondsToTime(secs){
      // seconds
      var s = Math.floor(secs % 60)
      var minutes = secs / 60
      var m = Math.floor(minutes%60)
      var hours = minutes / 60
      var h = Math.floor(hours % 24)
      var days = hours / 24
      var d = Math.floor(days)

      var arr = [d,h,m,s];
      var str = ""
      for(var i = 0; i < arr.length; i++){
        if(i == 0)
           str += arr[i].toFixed(0).toString();
        else
           str += String(arr[i].toFixed(0)).padStart(2,'0');
      
        str += ":"
         }
               str = str.substring(0,str.length-1);

      // str = d.toFixed(0).toString() + ":" + h.toFixed(0).toString() + ":" + m.toFixed(0).toString() + ":" + s.toFixed(0).toString()
      return str;

    }       

    // "http://router.project-osrm.org/trip/v1/driving/-73.999786,40.764389;-74.016678,40.703564;-73.985428,40.748817?source=first&roundtrip=false"
    // console.log(results);
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
