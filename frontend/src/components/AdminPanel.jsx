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
  const [data, setData] = useState({})
  const mapRef = useRef(null);
  const [legData,setLegData] = useState([])
	
  const childToParent = (data,ldat,pinpoints) => {
	// setData(data);
	// console.log("Parent Function Called");
	var geometry = data.geometry;
	// console.log("Creating Feature")
	/*var gjson_feature = {
		"type" : "Feature",
		"properties": {
			"name": "Path",
		},
		"geometry":geometry
	};*/
	//console.log("Created Feature")
	console.log(ldat);
	setLegData(ldat);

  mapRef.current.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      mapRef.current.removeLayer(layer);
    }
  });

  // Add markers for each pinpoint
  pinpoints.forEach((pinpoint) => {
    var marker = L.marker([pinpoint.lat, pinpoint.long])
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
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Dropdown
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#">
                        Action
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Another action
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Something else here
                      </a>
                    </li>
                  </ul>
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
        < Geocoding childToParent={childToParent}/>
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
			<th scope="row">{new Date(legDat["Start_Time"]).toString()}</th>
	                <th >{legDat["Location_1"] + " to " + legDat["Location_2"]}</th>
	                <th >{new Date((legDat["Start_Time"] + (legDat["Duration"] * 1000))).toString()}</th>
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
