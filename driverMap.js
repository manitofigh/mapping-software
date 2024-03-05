// Creating map options
var mapOptions = {
   center: [40.7169, -73.5990],
   zoom: 15
}

// Creating a map object
var map = new L.map('driverMap', mapOptions);

// Creating a Layer object
var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

// Adding layer to the map
map.addLayer(layer);