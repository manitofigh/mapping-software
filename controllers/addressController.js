import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';
import AddressModel from '../models/AddressModel.js';
import authController from './authController.js';
import nodeGeocoder from 'node-geocoder';
import axios from 'axios';
import _ from 'lodash';
import dotenv from 'dotenv';

dotenv.config();

const options = {
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
};
  
const geocoder = nodeGeocoder(options);

const addressController = {

  async getAddressesForDriver(req, res) {
    const driverId = req.params.driverId;
    try {
      const addresses = await AdminModel.getAddressesForDriver(driverId);
      res.json(addresses);
    } catch (error) {
      console.error('Error fetching addresses for driver:', error);
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        routeGeometries: await AddressModel.getRouteGeometries(),
        errorTitle: 'Error Fetching Addresses',
        errorBody: 'An error occurred while fetching addresses for the selected driver. Please try again.',
      });
    }
  },

  async addAddress(req, res) {
    // Input sanitization and validation
    if (!req.body.address || !req.body.driverEmail) {
      
      const drivers = await AdminModel.getDrivers();
      const activeTrips = [];

      for (const driver of drivers) {
        const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
        if (highestPendingTripNumber) {
          const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          const tripGeometry = await AddressModel.getTripGeometryByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          activeTrips.push({ driverEmail: driver.email, deliveryJobs, tripGeometry });
        }
      }
      const renderOptions = {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          drivers: drivers,
          pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
          activeTrips: activeTrips,
          errorTitle: 'Error',
          errorBody: 'Please make sure you have selected a driver and entered an address.',
          previousAddress: req.body.address || '',
          previousDriverEmail: req.body.driverEmail || ''
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
      return;
    }

    const { address, driverEmail } = req.body;
    const addressLines = address.trim().split('\n').filter(line => line.trim() !== '');

    if (addressLines.length === 0) {

      const drivers = await AdminModel.getDrivers();
      const activeTrips = [];

      for (const driver of drivers) {
        const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
        if (highestPendingTripNumber) {
          const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          const tripGeometry = await AddressModel.getTripGeometryByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          activeTrips.push({ driverEmail: driver.email, deliveryJobs, tripGeometry });
        }
      }

      const renderOptions = {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          drivers: drivers,
          pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
          activeTrips: activeTrips,
          errorTitle: 'Error',
          errorBody: 'Please enter at least one valid address.',
          previousAddress: '',
          previousDriverEmail: driverEmail
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
      return;
    }

    try {
        const driver = await AdminModel.getDriverByEmail(driverEmail);
        const drivers = await AdminModel.getDrivers();
        const activeTrips = [];
  
        for (const driver of drivers) {
          const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
          if (highestPendingTripNumber) {
            const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
            const tripGeometry = await AddressModel.getTripGeometryByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
            activeTrips.push({ driverEmail: driver.email, deliveryJobs, tripGeometry });
          }
        }
        if (!driver) {
            const renderOptions = {
              user: req.user,
              pendingApplications: await AdminModel.countPendingApplications(),
              drivers: drivers,
              activeTrips: activeTrips,
              errorTitle: 'Error',
              errorBody: 'Invalid driver selected.',
              previousAddress: address,
              previousDriverEmail: driverEmail
            };
            res.render('admin/adminDashboard.ejs', renderOptions);
            return;
        }

        const geocodedAddresses = await Promise.all(addressLines.map(async (line) => {
            const cachedLocation = await AddressModel.getGeocodedLocation(line.trim());
            if (cachedLocation) {
                console.log(`Using cached location for address: ${line}`);
                return {
                    address: line,
                    latLon: cachedLocation.lat_lon,
                    realAddress: cachedLocation.real_address,
                    quality: cachedLocation.quality
                };
            } else {
                console.log(`Calling API for address: ${line}`);
                const geocodedResponse = await geocoder.geocode(line);
                if (geocodedResponse.length > 0) {
                    const { latitude, longitude, formattedAddress, countryCode } = geocodedResponse[0];
                    const latLon = `${latitude},${longitude}`;
                    const quality = countryCode === 'US' ? 'valid' : 'invalid';
                    await AddressModel.addGeocodedLocation(line.trim(), latLon, formattedAddress, quality);
                    return { address: line, latLon, realAddress: formattedAddress, quality };
                } else {
                    await AddressModel.addGeocodedLocation(line, null, null, 'invalid');
                    return { address: line, latLon: null, realAddress: null, quality: 'invalid' };
                }
            }
        }));

        const validAddresses = geocodedAddresses.filter(address => address.quality === 'valid');
        const invalidAddresses = geocodedAddresses.filter(address => address.quality === 'invalid');
    
        const uniqueValidAddresses = await Promise.all(validAddresses.map(async (address) => {
            const existingDeliveryLocation = await AddressModel.getDeliveryLocationByLatLonAndDriverEmail(address.latLon, driverEmail);
            if (!existingDeliveryLocation || existingDeliveryLocation.status !== 'pending') {
                return address;
            }
            return null;
        }));
    
        const filteredValidAddresses = uniqueValidAddresses.filter(address => address !== null);
        const duplicateAddresses = validAddresses.filter(address => 
            uniqueValidAddresses.find(uniqueAddress => uniqueAddress !== null && uniqueAddress.latLon === address.latLon) === undefined
        ).map(address => address.address);

        await Promise.all(filteredValidAddresses.map(async (address) => {
            await AddressModel.addDeliveryLocation(address.address.trim(), address.latLon, driverEmail, driver.color, 'pending', authController.getFormattedTime());
        }));

        const errorBody = invalidAddresses.length > 0
            ? 'List of invalid addresses have been provided in the address entry field.'
            : duplicateAddresses.length > 0
                ? `You entered duplicate addresses.`
                : undefined;
        const duplicateAddressesMessage = duplicateAddresses.length > 0 ? `Previously-assigned addresses for ${driverEmail}: ${duplicateAddresses.join('--- ')}` : '';

        const renderOptions = {
            user: req.user,
            pendingApplications: await AdminModel.countPendingApplications(),
            drivers: drivers,
            pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
            activeTrips: activeTrips,
            errorTitle: invalidAddresses.length > 0 || duplicateAddresses.length > 0 ? 'Invalid address' : undefined,
            errorBody: errorBody ? `${errorBody} ${duplicateAddressesMessage}` : undefined,
            successTitle: filteredValidAddresses.length > 0 ? 'Success' : undefined,
            successBody: filteredValidAddresses.length > 0 ? `${filteredValidAddresses.length} ${filteredValidAddresses.length === 1 ? 'address was' : 'addresses were'} added successfully.` : undefined,
            previousAddress: [...invalidAddresses.map(eaddress => address.address), ...duplicateAddresses].join('\n'),
            previousDriverEmail: driverEmail
        };

        res.render('admin/adminDashboard.ejs', renderOptions);
    } catch (error) {
        console.error('Error adding addresses:', error);

        const drivers = await AdminModel.getDrivers();
        const activeTrips = [];
  
        for (const driver of drivers) {
          const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
          if (highestPendingTripNumber) {
            const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
            const tripGeometry = await AddressModel.getTripGeometryByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
            activeTrips.push({ driverEmail: driver.email, deliveryJobs, tripGeometry });
          }
        }
        
        const renderOptions = {
            user: req.user,
            pendingApplications: await AdminModel.countPendingApplications(),
            drivers: drivers,
            pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
            activeTrips: activeTrips,
            errorTitle: 'Error Adding Addresses',
            errorBody: 'An error occurred while adding the addresses. Please try again.',
            previousAddress: address,
            previousDriverEmail: driverEmail
        };
        res.render('admin/adminDashboard.ejs', renderOptions);
    }
  },

  async removeDeliveryLocation(req, res) {
    const { address, driverEmail } = req.body;

    const drivers = await AdminModel.getDrivers();
    const activeTrips = [];

    for (const driver of drivers) {
      const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
      if (highestPendingTripNumber) {
        const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
        const tripGeometry = await AddressModel.getTripGeometryByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
        activeTrips.push({ driverEmail: driver.email, deliveryJobs, tripGeometry });
      }
    }
  
    try {
      await AddressModel.updateDeliveryLocationStatus(address, driverEmail, 'deleted');
      const renderOptions = {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: drivers,
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        activeTrips: activeTrips,
        successTitle: 'Success',
        successBody: `Removed location "${address}" for "${driverEmail}".`,
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
    } catch (error) {
      console.error('Error removing delivery location:', error);

      const drivers = await AdminModel.getDrivers();
      const activeTrips = [];
      for (const driver of drivers) {
        const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
        if (highestPendingTripNumber) {
          const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          activeTrips.push({ driverEmail: driver.email, deliveryJobs });
        }
      }

      const renderOptions = {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: drivers,
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        pendingAndAssignedDeliveryLocations: await AddressModel.getPendingAndAssignedDeliveryLocations(),
        routeGeometries: await AddressModel.getRouteGeometries(),
        activeTrips: activeTrips,
        errorTitle: 'Error Removing Delivery Location',
        errorBody: 'An error occurred while removing the delivery location. Please try again.',
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
    }
  },

  async createTrips(req, res) {
    try {
      // const { warehouseLocation } = req.body;
      const warehouseLocation = '40.7168988,-73.59903779999999';
      const warehouseName = 'Hofstra University';
      const drivers = await AdminModel.getDrivers();
  
      for (const driver of drivers) {
        const pendingLocations = await AddressModel.getPendingDeliveryLocationsByDriverEmail(driver.email);
  
        if (pendingLocations.length > 0) {
          const locations = [warehouseLocation, ...pendingLocations.map(location => location.lat_lon)];
  
          const coordinates = locations.map(location => {
            let [lat, lon] = location.split(',').map(coord => coord.trim());
            return `${lon},${lat}`;  // lon comes first for OSRM
          }).join(';');
          
          const osrmUrl = `http://router.project-osrm.org/trip/v1/driving/${coordinates}?source=first&roundtrip=false&geometries=geojson&steps=true&annotations=duration,distance`;          
          console.log(`OSRM URL for DRIVER: ${driver.email}: ${osrmUrl}`);  // Debugging line to check the URL
  
          const osrmResponse = await axios.get(osrmUrl);
  
          if (osrmResponse.data.code === 'Ok') {
            const { trips, waypoints } = osrmResponse.data;
            const { geometry, legs } = trips[0];
          
            const tripGeometry = JSON.stringify(geometry);
          
            const highestTripNumber = await AddressModel.getHighestTripNumberByDriverEmail(driver.email);
            const tripNumber = highestTripNumber ? highestTripNumber + 1 : 1;
          
            // Store the full geometry of the trip
            await AddressModel.createTripGeometry(driver.email, tripNumber, tripGeometry, driver.color);
          
            for (let i = 0; i < legs.length; i++) {
              const leg = legs[i];
              const steps = leg.steps;
          
              if (steps && steps.length > 0) {
                const startWaypointIndex = steps[0].geometry.coordinates[0];
                const endWaypointIndex = steps[steps.length - 1].geometry.coordinates[steps[steps.length - 1].geometry.coordinates.length - 1];
          
                const startWaypoint = waypoints.find(waypoint => waypoint.location[0] === startWaypointIndex[0] && waypoint.location[1] === startWaypointIndex[1]);
                const endWaypoint = waypoints.find(waypoint => waypoint.location[0] === endWaypointIndex[0] && waypoint.location[1] === endWaypointIndex[1]);
          
                console.log('Start Waypoint:', startWaypoint);
                console.log('End Waypoint:', endWaypoint);
          
                const startAddress = i === 0 ? warehouseName : findClosestPendingLocation(startWaypoint.location, pendingLocations)?.address;
                const endAddress = findClosestPendingLocation(endWaypoint.location, pendingLocations)?.address;
          
                console.log('Start Address:', startAddress);
                console.log('End Address:', endAddress);
          
                if (!startAddress || !endAddress) {
                  console.warn('Skipping leg due to missing address information');
                  continue;
                }
          
                const startLatLon = i === 0 ? warehouseLocation : `${startWaypoint.location[1]},${startWaypoint.location[0]}`;
                const endLatLon = `${endWaypoint.location[1]},${endWaypoint.location[0]}`;
          
                const estimatedDurationMinutes = Math.ceil(leg.duration / 60);
                const distance = leg.distance;
          
                await AddressModel.createDeliveryJob(
                  driver.email,
                  tripNumber,
                  i,
                  startAddress,
                  endAddress,
                  startLatLon,
                  endLatLon,
                  estimatedDurationMinutes,
                  distance,
                  driver.color
                );
          
                await AddressModel.updateDeliveryLocationStatus(endAddress, driver.email, 'assigned');
              } else {
                console.warn('Leg does not have steps or steps array is empty:', leg);
              }
            }
          
            await AddressModel.updateTripGeometryStatus(driver.email, tripNumber, 'pending');
          } else {
            console.error('Error creating optimal route:', osrmResponse.data);
          }
          
          // Helper function to find the closest pending location
          function findClosestPendingLocation(waypointLocation, pendingLocations) {
            let closestLocation = null;
            let minDistance = Infinity;
          
            for (const location of pendingLocations) {
              const [lat, lon] = location.lat_lon.split(',');
              const distance = calculateDistance(waypointLocation[1], waypointLocation[0], parseFloat(lat), parseFloat(lon));
          
              if (distance < minDistance) {
                minDistance = distance;
                closestLocation = location;
              }
            }
          
            return closestLocation;
          }
          
          // Helper function to calculate the distance between two coordinates
          function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth's radius in kilometers
            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon2 - lon1);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return distance;
          }
          
          function toRadians(degrees) {
            return degrees * (Math.PI / 180);
          }
        }
      }

      const activeTrips = [];

      for (const driver of drivers) {
        const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
        if (highestPendingTripNumber) {
          const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          const tripGeometry = await AddressModel.getTripGeometryByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          activeTrips.push({ driverEmail: driver.email, deliveryJobs, tripGeometry });
        }
      }
  
      const renderOptions = {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        activeTrips,
        successTitle: 'Success',
        successBody: 'Trip created successfully.',
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
    } catch (error) {

      console.error('Error creating trips:', error);
      const drivers = await AdminModel.getDrivers();
      const activeTrips = [];
      for (const driver of drivers) {
        const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
        if (highestPendingTripNumber) {
          const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          activeTrips.push({ driverEmail: driver.email, deliveryJobs });
        }
      }
      const renderOptions = {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: drivers,
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        activeTrips: activeTrips,
        errorTitle: 'Error Creating Trips',
        errorBody: 'An error occurred while creating trips. Please try again.',
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
    }
  },

};

export default addressController;