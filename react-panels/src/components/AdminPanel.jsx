import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/css/styleLeaflet.css";
import "../assets/css/style.css";

const AdminPanel = () => {
  const [bars, setBars] = useState({
    left: false,
    right: false,
    bottom: false,
  });

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

    const map = new L.map('adminMap', mapOptions);
    const layer = new L.TileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    );
    map.addLayer(layer);

    // Cleanup function to remove the map when the component unmounts or needs to reinitialize
    return () => {
      map.remove();
    };
  }, []);

  const toggleBar = (barName) => {
    setBars((prevBars) => ({ ...prevBars, [barName]: !prevBars[barName] }));
  };

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
        right bar
      </div>
      <div className={`bottom-bar ${bars.bottom ? "bar-collapsed" : ""}`}>
        bottom bar
      </div>
      <div className="main-content" id="adminMap">
        <button
          className="collapse-btn"
          onClick={() => toggleBar("left")}
          title="Collapse/Show"
        >
          Toggle Left Bar
        </button>
        <button
          className="collapse-btn"
          onClick={() => toggleBar("right")}
          title="Collapse/Show"
        >
          Toggle Right Bar
        </button>
        <button
          className="collapse-btn"
          onClick={() => toggleBar("bottom")}
          title="Collapse/Show"
        >
          Toggle Bottom Bar
        </button>
        <button
          className="collapse-btn"
          disabled={!isAnyBarCollapsed()}
          onClick={() => setBars({ left: false, right: false, bottom: false })}
          title="Reset Layout"
        >
          Reset Layout
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
