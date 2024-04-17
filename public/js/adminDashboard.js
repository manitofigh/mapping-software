document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('mapContainer').setView([37.0902, -95.7129], 4);
  
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: 'png'
    }).addTo(map);
  
    // Set the maximum bounds to limit the map to the United States
    const usBounds = [
      [24.9493, -125.0011], // Southwest coordinates
      [49.5904, -66.9326]   // Northeast coordinates
    ];
    map.setMaxBounds(usBounds);
  
    // Fetch drivers and populate the dropdown
    async function fetchDrivers() {
      try {
        const response = await axios.get('/admin/drivers');
        const drivers = response.data;
        const driverSelect = document.getElementById('driverSelect');
        drivers.forEach(driver => {
          const option = document.createElement('option');
          option.value = driver.id;
          option.textContent = driver.name;
          driverSelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    }
  
    // Fetch addresses for the selected driver and render on the map
    async function fetchAddressesForDriver() {
      const driverId = document.getElementById('driverSelect').value;
      try {
        const response = await axios.get(`/admin/drivers/${driverId}/addresses`);
        const addresses = response.data;
        renderAddressesOnMap(addresses);
      } catch (error) {
        console.error('Error fetching addresses for driver:', error);
      }
    }
  
    // Render addresses on the map
    function renderAddressesOnMap(addresses) {
      addresses.forEach(address => {
        const marker = L.marker([address.latitude, address.longitude]).addTo(map);
        marker.bindPopup(address.address);
      });
    }
  
    // Event listener for driver selection change
    document.getElementById('driverSelect').addEventListener('change', fetchAddressesForDriver);
  
    // Fetch drivers on page load
    fetchDrivers();
  });