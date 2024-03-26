import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/css/styleLeaflet.css';
import '../assets/css/style.css';

const DriverPanel = () => {
    const [bars, setBars] = useState({ right: false, bottom: false });

    useEffect(() => {
        // Map initialization
        const mapOptions = {
            center: [40.7169, -73.5990],
            zoom: 15,
        };

        const map = new L.map('driverMap', mapOptions);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
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
                {/* Navigation and other top bar content */}
            </div>
            <div className={`main-content ${bars.bottom ? 'main-expanded-bottom' : ''} ${bars.right ? 'main-expanded-left-right' : ''}`} id="driverMap">
                {/* Main content and map container */}
                <button className="collapse-btn" onClick={() => toggleBar('bottom')} title="Collapse/Show Bottom Bar">Bottom Bar</button>
                <button className="collapse-btn" onClick={() => toggleBar('right')} title="Collapse/Show Right Bar">Right Bar</button>
                <button className="collapse-btn" disabled={!bars.right && !bars.bottom} onClick={resetLayout} title="Reset Layout">Reset Layout</button>
            </div>
            <div className={`right-bar ${bars.right ? 'bar-collapsed' : ''}`}>
                right bar
            </div>
            <div className={`bottom-bar ${bars.bottom ? 'bar-collapsed' : ''}`}>
                bottom bar
            </div>
        </div>
    );
};

export default DriverPanel;
