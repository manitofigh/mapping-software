import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../assets/css/styleLeaflet.css';
import "../assets/css/style.css";

const DriverPanel = () => {
  const [bars, setBars] = useState({ right: false, bottom: false });

  useEffect(() => {
    // Map initialization
    const mapOptions = {
      center: [40.7169, -73.599],
      zoom: 15,
    };

    const map = new L.map("driverMap", mapOptions);
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  }, []);

  const toggleBar = (barName) => {
    setBars((prevBars) => ({ ...prevBars, [barName]: !prevBars[barName] }));
  };

  const resetLayout = () => {
    setBars({ right: false, bottom: false });
  };

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
                    className="btn btn-danger disabled"
                    id="reset-layout-btn"
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
                <a className="btn btn-outline-success" href="./adminPanel.html">
                  Admin Panel →
                </a>
              </form>
            </div>
          </div>
        </nav>
      </div>

      <div
        className={`main-content ${bars.bottom ? "main-expanded-bottom" : ""} ${
          bars.right ? "main-expanded-left-right" : ""
        }`}
        id="driverMap"
      >
        <div className="main-content main-expanded-left" id="driverMap">
          {/*hide/show (collapse) buttons*/}
          <button
            className="collapse-btn"
            id="bottom-bar-collapse-btn"
            title="Collapse/Show"
          />
          <button
            className="collapse-btn"
            id="right-bar-collapse-btn"
            title="Collapse/Show"
          />
        </div>
        <button
          className="collapse-btn"
          onClick={() => toggleBar("bottom")}
          title="Collapse/Show Bottom Bar"
        >
          Bottom Bar
        </button>
        <button
          className="collapse-btn"
          onClick={() => toggleBar("right")}
          title="Collapse/Show Right Bar"
        >
          < Geocoding />
        </button>
        <button
          className="collapse-btn"
          disabled={!bars.right && !bars.bottom}
          onClick={resetLayout}
          title="Reset Layout"
        >
          Reset Layout
        </button>
      </div>
      <div className={`right-bar ${bars.right ? "bar-collapsed" : ""}`}>
        right bar
      </div>
      <div className={`bottom-bar ${bars.bottom ? "bar-collapsed" : ""}`}>
        bottom bar
      </div>
    </div>
  );
};

export default DriverPanel;
