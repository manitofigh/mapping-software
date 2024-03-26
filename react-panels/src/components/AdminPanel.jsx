import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/css/styleLeaflet.css';
import '../assets/css/style.css';

const AdminPanel = () => {
    const [bars, setBars] = useState({ left: false, right: false, bottom: false });

    useEffect(() => {
        // Initialize the map when the component mounts
        const mapOptions = {
            center: [40.7169, -73.5990],
            zoom: 15,
        };

        const map = new L.map('adminMap', mapOptions);
        const layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        map.addLayer(layer);
    }, []);

    const toggleBar = (barName) => {
        setBars((prevBars) => ({ ...prevBars, [barName]: !prevBars[barName] }));
    };

    const isAnyBarCollapsed = () => Object.values(bars).some((status) => status);

    return (
        <div className="main-container">
            <div className="top-bar">
                <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="#">Slick</a>
                        {/* More nav items */}
                    </div>
                </nav>
            </div>
            <div className={`left-bar ${bars.left ? 'bar-collapsed' : ''}`}>
                left bar
            </div>
            <div className={`right-bar ${bars.right ? 'bar-collapsed' : ''}`}>
                right bar
            </div>
            <div className={`bottom-bar ${bars.bottom ? 'bar-collapsed' : ''}`}>
                bottom bar
            </div>
            <div className="main-content" id="adminMap">
                <button className="collapse-btn" onClick={() => toggleBar('left')} title="Collapse/Show">Toggle Left Bar</button>
                <button className="collapse-btn" onClick={() => toggleBar('right')} title="Collapse/Show">Toggle Right Bar</button>
                <button className="collapse-btn" onClick={() => toggleBar('bottom')} title="Collapse/Show">Toggle Bottom Bar</button>
                <button className="collapse-btn" disabled={!isAnyBarCollapsed()} onClick={() => setBars({ left: false, right: false, bottom: false })} title="Reset Layout">Reset Layout</button>
            </div>
        </div>
    );
};

export default AdminPanel;
