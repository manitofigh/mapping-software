document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('mapContainer').setView([37.0902, -95.7129], 4);
  
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      ext: 'png'
    }).addTo(map);
  
    // Set the maximum bounds to limit the map to the United States
    const usBounds = [
      [24.9493, -125.0011], // Southwest coordinates
      [49.5904, -66.9326]   // Northeast coordinates
    ];
    map.setMaxBounds(usBounds);
  
    // Fetch optimized route for the logged-in driver and render on the map
    async function fetchOptimizedRoute() {
      try {
        const response = await axios.get('/driver/route');
        const route = response.data;
        renderOptimizedRouteOnMap(route);
      } catch (error) {
        console.error('Error fetching optimized route:', error);
      }
    }
  
    // Render optimized route on the map
    function renderOptimizedRouteOnMap(route) {
      const coordinates = route.coordinates;
      const polyline = L.polyline(coordinates, { color: route.color }).addTo(map);
      map.fitBounds(polyline.getBounds());
    }
  
    // Fetch optimized route on page load
    fetchOptimizedRoute();
  });