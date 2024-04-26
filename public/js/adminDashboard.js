// document.addEventListener('DOMContentLoaded', () => {
//     const map = L.map('mapContainer', {
//       minZoom: 4, // Set the minimum zoom level
//       maxZoom: 18, // Set the maximum zoom level
//       zoomControl: true // Add zoom control
//     }).setView([37.0902, -95.7129], 4);

//     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       maxZoom: 19,
//       attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//     }).addTo(map);
  
//     // Set the maximum bounds to limit the map to the United States
//     const usBounds = [
//       [24.9493, -125.0011], // Southwest coordinates
//       [49.5904, -66.9326]   // Northeast coordinates
//     ];
//     map.setMaxBounds(usBounds);
  
//     // Fetch addresses for the selected driver and render on the map
//     async function fetchAddressesForDriver() {
//       const driverId = document.getElementById('driverSelect').value;
//       try {
//         const response = await axios.get(`/admin/drivers/${driverId}/addresses`);
//         const addresses = response.data;
//         renderAddressesOnMap(addresses);
//       } catch (error) {
//         console.error('Error fetching addresses for driver:', error);
//       }
//     }
  
//     // Render addresses on the map
//     function renderAddressesOnMap(addresses) {
//       addresses.forEach(address => {
//         const marker = L.marker([address.latitude, address.longitude]).addTo(map);
//         marker.bindPopup(address.address);
//       });
//     }
  
//     // Event listener for driver selection change
//     document.getElementById('driverSelect').addEventListener('change', fetchAddressesForDriver);
//   });