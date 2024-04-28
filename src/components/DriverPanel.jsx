import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/css/style.css";
import '../assets/css/styleLeaflet.css';


const DriverPanel = ({changeState}) => {
  
  const [bars, setBars] = useState({ left: false, bottom: false });
  const [isResetDisabled, setIsResetDisabled] = useState(true);

  const [legData,setLegData] = useState([])
  const mapRef = useRef(null);

  useEffect(() => {
    // Ensure the map container is clean before initializing a new map
    let container = L.DomUtil.get('driverMap');
    if (container != null) {
      container._leaflet_id = null;
    }

    const mapOptions = {
      center: [40.7169, -73.599],
      zoom: 15,
    };

    mapRef.current = new L.map('driverMap', mapOptions);
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

  useEffect(() => {
    updateLayout();
    
    var num = 1;
    if(bars.left)
	    num++;

    var driverMap = document.getElementById("driverMap");
    driverMap.style.gridColumn = "span " + (num+1).toString();

    var leftSideBar = document.getElementsByClassName("left-bar")
    if(bars.bottom){
      leftSideBar[0].style.gridRow = "2 / span 2"
      driverMap.style.gridRow = "2 / span 2"
    } else {
      leftSideBar[0].style.gridRow = "2 / span 1"
      driverMap.style.gridRow = "2 / span 1"
    }

  }, [bars]);

  // Mimics the updateLayout function from jQuery, using React state
  const updateLayout = () => {
    const anyCollapsed = Object.values(bars).some(value => value);
    setIsResetDisabled(!anyCollapsed);
  };

  /*
  const mapRef = useRef(null);

  useEffect(() => {
    // Ensure the map container is clean before initializing a new map
    let container = L.DomUtil.get('driverMap');
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



 

  const resetLayout = () => {
    setBars({ right: false, bottom: false });
  };
  */
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

  const toggleBar = (barName) => {
    setBars(prevBars => {
      const updatedBars = { ...prevBars, [barName]: !prevBars[barName] };
      return updatedBars;
    });
  };

  const changeToAdmin = () => {
    //console.log("Driver Called");
    changeState(1);
  }

  const signOut = () => {
    changeState(0);
  }

  return (
    <div className="main-container">
      <div className="top-bar">
        <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">Slick</a>
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
                <li className="nav-item" style={{ marginLeft: 10 }}>
                  <button className="btn btn-outline-danger" onClick={signOut}>
                    Sign Out →
                  </button>
                </li>
              </ul>
              <div className="d-flex" role="search">
                <button className="btn btn-outline-succes" onClick={changeToAdmin}>Admin Portal →</button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className={`left-bar ${bars.left ? "bar-collapsed" : ""}`}>
        left bar
      </div>
      <div className={`bottom-bar ${bars.bottom ? "bar-collapsed" : ""}`}>
        <table class="itinerary">
          <thead class="table-head">
            <tr>
              <th scope="col">Start Time </th>
              <th scope="col">Route Leg </th>
              <th scope="col">End Time </th>
              <th scope="col">Finished</th>
            </tr>
          </thead>
          <tbody>
          {legData.map((legDat,index) => (
			      <tr key={index}>
				      <th scope="row">
					      <div class="date">
                  {legDat["date"]}
                </div>
						    <div>
                  {legDat["time"]}
						    </div>
				    </th>
					<th >{legDat["location1"] + " to " + legDat["location2"]}</th>
					<th >{returnEndTime(new Date((legDat["start_time"] + (legDat["duration"] * 1000))))}</th>
          <th><button>Send To User</button></th>
			    </tr>
			    ))}
          </tbody>
        </table>
      </div>
      <div className="main-content" id="driverMap">
        <button className="collapse-btn" id="left-bar-collapse-btn" onClick={() => toggleBar("left")} title="Collapse/Show"/>
        <button className="collapse-btn" id="bottom-bar-collapse-btn" onClick={() => toggleBar("bottom")} title="Collapse/Show"/>
      </div>
    </div>
  );
};

export default DriverPanel;
