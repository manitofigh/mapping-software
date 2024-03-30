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

  // Additional state to manage whether the reset button is disabled
  const [isResetDisabled, setIsResetDisabled] = useState(true);

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
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    );
    map.addLayer(layer);

    // Cleanup function to remove the map when the component unmounts or needs to reinitialize
    return () => {
      map.remove();
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

  const toggleBar = (barName) => {
    setBars(prevBars => {
      const updatedBars = { ...prevBars, [barName]: !prevBars[barName] };
      return updatedBars;
    });
  };

  // Utilize effect hook to apply layout changes whenever bars' states change
  useEffect(() => {
    updateLayout();
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
        right bar
      </div>
      <div className={`bottom-bar ${bars.bottom ? "bar-collapsed" : ""}`}>
        bottom bar
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