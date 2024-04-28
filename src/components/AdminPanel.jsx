import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/css/styleLeaflet.css";
import "../assets/css/style.css";
import Geocoding from "./RightBarContent";

const AdminPanel = () => {
  const [bars, setBars] = useState({
    left: false,
    right: false,
    bottom: false,
  });



  // Additional state to manage whether the reset button is disabled
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  //const [data, setData] = useState({})
  const mapRef = useRef(null);
  const functionRefs = useRef(null);
  const [legData,setLegData] = useState([])
	
  const childToParent = (data,ldat,pinpoints) => {
	// setData(data);
	// console.log("Parent Function Called");
	// console.log("Creating Feature")
	/*var gjson_feature = {
		"type" : "Feature",
		"properties": {
			"name": "Path",
		},
		"geometry":geometry
	};*/
	//console.log("Created Feature")
	var geometry = data.trips[0].geometry;
	console.log(ldat);
	setLegData(ldat);

	mapRef.current.eachLayer((layer) => {
		if (layer instanceof L.Marker) {
		mapRef.current.removeLayer(layer);
		}
	});

	// Add markers for each pinpoint
	pinpoints.forEach((pinpoint) => {
		var marker = L.marker([pinpoint.latitude, pinpoint.longitude])
		.bindPopup(pinpoint.formattedAddress)
		.addTo(mapRef.current);
	});
		//console.log(gjson_feature);
		
	if(mapRef.gJSONLayer != null)
	  mapRef.gJSONLayer.remove();	

	mapRef.gJSONLayer = L.geoJSON(geometry);
	mapRef.gJSONLayer.addTo(mapRef.current);
	mapRef.current.fitBounds(mapRef.gJSONLayer.getBounds());
  
  }

  useEffect(() => {
    // Ensure the map container is clean before initializing a new map
    let container = L.DomUtil.get('adminMap');
    if (container != null) {
      container._leaflet_id = null;
    }

    const mapOptions = {
      center: [40.7169, -73.599],
      zoom: 15,
    };

    mapRef.current = new L.map('adminMap', mapOptions);
    const layer = new L.TileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    );
    mapRef.current.addLayer(layer);
    // mapRef.gJsonLayer = L.geoJSON().addTo(mapRef.current);
    

    // Cleanup function to remove the map when the component unmounts or needs to reinitialize
    return () => {
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  // Mimics the resetLayout function from jQuery, using React state
  const resetLayout = () => {
    setBars({ left: false, right: false, bottom: false });
  };

  // Mimics the updateLayout function from jQuery, using React state
  const updateLayout = () => {
    const anyCollapsed = Object.values(bars).some(value => value);
    setIsResetDisabled(!anyCollapsed);
  };

  const sideButtonPressed = (barName) => {
	toggleBar(barName);
	console.log(bars.left);
	console.log(bars.right);
	var num = 1;
	if(!bars.left)
	   num++;
	if(!bars.right)
	   num++;

	console.log(num);

  }

  const toggleBar = (barName) => {
    setBars(prevBars => {
      const updatedBars = { ...prevBars, [barName]: !prevBars[barName] };
      return updatedBars;
    });
  };

  // Utilize effect hook to apply layout changes whenever bars' states change
  useEffect(() => {
    updateLayout();
    var num = 1;
    if(bars.left)
	  num++;
    if(bars.right)
	  num++;
    
    // console.log(num);
    var adminMap = document.getElementById("adminMap")
    adminMap.style.gridColumn = "span " + num.toString();
    
    var leftSideBar = document.getElementsByClassName("left-bar")

    var rightSideBar = document.getElementsByClassName("right-bar")
    if(bars.bottom){
	rightSideBar[0].style.gridRow = "2 / span 2"
	leftSideBar[0].style.gridRow = "2 / span 2"
	adminMap.style.gridRow = "2 / span 2"
    } else {
	rightSideBar[0].style.gridRow = "2 / span 1"
	leftSideBar[0].style.gridRow = "2 / span 1"
	adminMap.style.gridRow = "2 / span 1"
    }
    

    
  }, [bars]);

  const isAnyBarCollapsed = () => Object.values(bars).some((status) => status);

  function changeDate(targetDateValue,index){
	//console.log(targetDateValue);
	var check1 = false;
	var inputValues = targetDateValue.split("/");
	var valuesArr = [];
	inputValues.forEach(val => {
		valuesArr.push(parseInt(val));
	})
	var slashCount = inputValues.length - 1;
	if(slashCount == 2){ // Checks if contains 2 slashes
		check1 = true;
		//console.log("has 2 slashes");
	}
	
	if(check1 == false)
	  return;

	//console.log(valuesArr);
	var check2 = true // Checks if each val > 0
	valuesArr.forEach(val => {
		if(val <= 0)
			check2 = false
		else if(isNaN(val))
			check2 = false
	}) 

	if(check2 == false)
	  	return;
	
	var check3 = true; // Checks if each value is valid 

	if(valuesArr[0] > 12)
	 	 check3 = false;
	if(valuesArr[1] > 31)
	  	check3 = false;
	if(valuesArr[2] < 2024)
	  	check3 = false;
	if(valuesArr[2] > 2099)
	  	check3 = false;
	
	if(check3 == false)
	  	return;


	//console.log(check3);
	//console.log("Passed Check 3");
	
	var inputtedDate = new Date();
	//console.log(inputValues)
	inputtedDate.setMonth(inputValues[0]-1);
	inputtedDate.setDate(inputValues[1]);
	inputtedDate.setYear(inputValues[2]);
	//console.log(inputtedDate);
	
	var currentTime = legData[index]["time"];
	var timeVals = parseTime(currentTime);
	var hour = parseInt(timeVals[0]);
	var minute = parseInt(timeVals[1]);
	var seconds = parseInt(timeVals[2]);
	if(timeVals[3] != "PM" && hour == 12)
		hour = 0;
	if(timeVals[3] == "PM")
	  	hour += 12;
	
	inputtedDate.setHours(hour-1);
	inputtedDate.setMinutes(minute);
	inputtedDate.setSeconds(seconds);
	
	updateDate(inputtedDate,index);
  }
  
  function updateTime(date,index){
	var tmp = null;
	const nextLegData = legData.map((d,i) => {
	  	if(i === index){
			d["date_obj"] = date;
			d["start_time"] = date.getTime();
			d["time"] = date.toLocaleString(Intl.DateTimeFormat().locale,{hour: "numeric",minute:"numeric",second:"numeric"})
			tmp = d;
		} else if( i > index){
			d["start_time"] = tmp["start_time"] + (tmp["duration"] * 1000) + 1000;
			d["date_obj"] = new Date(d["start_time"]);
			d["date"] = d["date_obj"].toLocaleString(Intl.DateTimeFormat().locale,{year:"numeric",month:"numeric",day:"numeric"});
			d["time"] = d["date_obj"].toLocaleString(Intl.DateTimeFormat().locale,{hour: "numeric",minute:"numeric",second:"numeric"})
			d["currentDate"] = new String(d["date"])
			d["currentTime"] = new String(d["time"])
			tmp = d;
		} 
		return d;
	});
	
	setLegData(nextLegData);
  }

  function updateDate(date,index){
	var tmp = null;
	const nextLegData = legData.map((d,i) => {
	  if(i === index){
		d["date_obj"] = date;
		d["date"] = d["date_obj"].toLocaleString(Intl.DateTimeFormat().locale,{year:"numeric",month:"numeric",day:"numeric"});
		d["start_time"] = date.getTime();
		tmp = d;
	  } else if (i > index) {
		d["start_time"] = tmp["start_time"] + (tmp["duration"] * 1000) + 1000;
		d["date_obj"] = new Date(d["start_time"]);
		d["date"] = d["date_obj"].toLocaleString(Intl.DateTimeFormat().locale,{year:"numeric",month:"numeric",day:"numeric"});
		d["currentDate"] = new String(d["date"])
		tmp = d;
	  }
	  return d;
	});
  }

  function parseTime(time){
	var arr = [];
	var vals = time.split(":");
	//console.log(vals);
	var secondSplit = vals[2].split(" ");
	//console.log(secondSplit);
	arr.push(vals[0]);
	arr.push(vals[1]);
	arr.push(...secondSplit);
	//console.log(arr);
	return arr;
  }

  const save = () => {
	functionRefs.current.doneInputting();
  }
  function run(){
	functionRefs.current.addressSort();
  }

  function changeTime(targetTimeValue,index){
	// console.log(targetTimeValue);
	// Check if it contains two ":"
	var colonCount = targetTimeValue.split(":").length-1;
	if(colonCount != 2)
	  	return;
	// Check if contains AM or PM 
	var amCheck = targetTimeValue.search("AM");
	var pmCheck = targetTimeValue.search("PM");
	if(amCheck == -1 && pmCheck == -1)
	  return;
	// Check if all values are positive
	var timeVals = parseTime(targetTimeValue);
	var timeArr = []
	timeVals.forEach(val => {
		if(!(val == "AM" || val == "PM"))
			timeArr.push(parseInt(val));
	});
	// console.log(timeArr);
	//var check3 = true; // All values are positive
	// if all inputs are not decimals or letter 


	var check4 = true; // Is Valid
	// Check if hour is 1-12
	if(timeArr[0] > 12 && timeArr[0] < 1)
	  check4 = false;
	// Checks if minutes is 0-59
	if(timeArr[1] > 59 && timeArr[1] < 0)
	  check4 = false;
	// Checks if seconds is 0-59
	if(timeArr[2] > 59 && timeArr[2] < 0)
	  check4 = false;
	
	if(check4 == false)
	  return;
	
	var hour = timeArr[0];
	if(timeVals[3] != "PM" && hour == 12)
	  hour = 0;
	if(timeVals[3] == "PM")
	  hour += 12;
	timeArr[0] = hour;
	
	var currentDate = legData[index]["date"];
	var dateStrVals = currentDate.split("/");
	var dateVals = []
	dateStrVals.forEach(val => {
		dateVals.push(parseInt(val));
	});
	
	// console.log(dateVals);
	var inputtedDate = new Date(dateVals[2],dateVals[0]-1,dateVals[1],...timeArr);
	// console.log(inputtedDate);
	updateTime(inputtedDate,index);
  }
  
  function handleCurrentTimeChange(value,index){
	const nextLegData = legData.map((d,i) => {
	  if(i === index){
		d["currentTime"] = value;
	  } 
	  return d;
	});
	setLegData(nextLegData);
  }
  function handleCurrentDateChange(value,index){
	const nextLegData = legData.map((d,i) => {
	  if(i === index){
		d["currentDate"] = value;
	  } 
	  return d;
	});
	setLegData(nextLegData);
  }

  function returnDate(date){
	var options = {
	  year: "numeric",
	  month: "numeric",
	  day: "numeric",
	}
	return date.toLocaleString(Intl.DateTimeFormat().locale,options);
  }
  function returnTime(date){
	var options = {
	  hour: "numeric",
	  minute: "numeric",
	  second: "numeric",
	}
	return date.toLocaleString(Intl.DateTimeFormat().locale,options);
  }

  function returnEndTime(date){
	var options = {
	  year: "numeric",
	  month: "numeric",
	  day: "numeric",
	  hour: "numeric",
	  minute: "numeric",
	  second: "numeric",
	}
	var region = new Intl.DateTimeFormat();
	options.timeZone = region.resolvedOptions().timeZone;
	options.timeZoneName = "short";
	

	var str = "";	
	str += date.toLocaleString(region.locale,options)
	// str += Intl.DateTimeFormat().resolvedOptions().timeZone; 
	// console.log(Intl.DateTimeFormat().resolvedOptions());
	return str;
	
  }

  return (
    <div className="main-container">
      <div className="top-bar">
        <nav
          className="navbar navbar-expand-lg bg-body-tertiary"
          data-bs-theme="dark"
        >
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              Slick
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="#">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Link
                  </a>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`btn btn-danger ${isResetDisabled ? "disabled" : ""}`}
                    id="reset-layout-btn"
                    onClick={resetLayout}
                  >
                    Reset Layout
                  </button>
                </li>
                <li className="nav-item" style={{ marginLeft: 10 }}>
                  <a
                    className="btn btn-outline-danger"
                    href="http://localhost:3000"
                  >
                    Sign Out →
                  </a>
                </li>
              </ul>
              <form className="d-flex" role="search">
			  	<button>Submit</button>
			  	<button onClick={run}>Run</button>
				<button onClick={save}>Save</button>
                <a
                  className="btn btn-outline-success"
                  href="./driverPanel.html"
                >
                  Driver Portal →
                </a>
              </form>
            </div>
          </div>
        </nav>
      </div>

      <div className={`left-bar ${bars.left ? "bar-collapsed" : ""}`}>
        left bar
      </div>
      <div className={`right-bar ${bars.right ? "bar-collapsed" : ""}`}>
        <Geocoding childToParent={childToParent} ref={functionRefs}/>
      </div>
      <div className={`bottom-bar ${bars.bottom ? "bar-collapsed" : ""}`}>
	  <table class="itinerary">
	      <thead class="table-head">
	        <tr>
	          <th scope="col">Start Time </th>
	          <th scope="col">Route Leg </th>
	  	  <th scope="col">End Time </th>
	        </tr>
	      </thead>
	      <tbody>
	          {legData.map((legDat,index) => (
		  <tr key={index}>
			<th scope="row">
				<div class="date_input">
			        <input 
			  			type="text"
			  			placeholder={returnDate(legDat["date_obj"])}
			  			value={legDat["currentDate"]}
			  			onChange={(e) => {handleCurrentDateChange(e.target.value,index);changeDate(e.target.value,index)}}/>
			        </div>
			        <div>
			  		<input
			  			type="text"
			  			placeholder={returnTime(legDat["date_obj"])}
						value={legDat["currentTime"]}
						onChange={(e) => {handleCurrentTimeChange(e.target.value,index);changeTime(e.target.value,index)}}/>
			        </div>
			  </th>
	                <th >{legDat["location1"] + " to " + legDat["location2"]}</th>
	                <th >{returnEndTime(new Date((legDat["start_time"] + (legDat["duration"] * 1000))))}</th>
		  </tr>
		  ))}
	      </tbody>
	  </table>
      </div>
      <div className="main-content" id="adminMap">
        <button
          className="collapse-btn"
          id="left-bar-collapse-btn"
          onClick={() => toggleBar("left")}
          title="Collapse/Show"
        >
        </button>
        <button
          className="collapse-btn"
          id="right-bar-collapse-btn"
          onClick={() => toggleBar("right")}
          title="Collapse/Show"
        >
        </button>
        <button
          className="collapse-btn"
          id="bottom-bar-collapse-btn"
          onClick={() => toggleBar("bottom")}
          title="Collapse/Show"
        >
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
