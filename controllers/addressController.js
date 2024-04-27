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
        errorTitle: 'Error Fetching Addresses',
        errorBody: 'An error occurred while fetching addresses for the selected driver. Please try again.',
      });
    }
  },

  async addAddress(req, res) {
    // Input sanitization and validation
    if (!req.body.address || !req.body.driverEmail) {
        const renderOptions = {
            user: req.user,
            pendingApplications: await AdminModel.countPendingApplications(),
            drivers: await AdminModel.getDrivers(),
            pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
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
        const renderOptions = {
            user: req.user,
            pendingApplications: await AdminModel.countPendingApplications(),
            drivers: await AdminModel.getDrivers(),
            pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
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
        if (!driver) {
            const renderOptions = {
                user: req.user,
                pendingApplications: await AdminModel.countPendingApplications(),
                drivers: await AdminModel.getDrivers(),
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
            drivers: await AdminModel.getDrivers(),
            pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
            errorTitle: invalidAddresses.length > 0 || duplicateAddresses.length > 0 ? 'Error' : undefined,
            errorBody: errorBody ? `${errorBody} ${duplicateAddressesMessage}` : undefined,
            successTitle: filteredValidAddresses.length > 0 ? 'Success' : undefined,
            successBody: filteredValidAddresses.length > 0 ? `${filteredValidAddresses.length} ${filteredValidAddresses.length === 1 ? 'address was' : 'addresses were'} added successfully.` : undefined,
            previousAddress: [...invalidAddresses.map(address => address.address), ...duplicateAddresses].join('\n'),
            previousDriverEmail: driverEmail
        };

        res.render('admin/adminDashboard.ejs', renderOptions);
    } catch (error) {
        console.error('Error adding addresses:', error);
        const renderOptions = {
            user: req.user,
            pendingApplications: await AdminModel.countPendingApplications(),
            drivers: await AdminModel.getDrivers(),
            pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
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
  
    try {
      await AddressModel.updateDeliveryLocationStatus(address, driverEmail, 'deleted');
      const renderOptions = {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        successTitle: 'Success',
        successBody: `Removed location ${address} for ${driverEmail}.`,
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
    } catch (error) {
      console.error('Error removing delivery location:', error);
      const renderOptions = {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        errorTitle: 'Error Removing Delivery Location',
        errorBody: 'An error occurred while removing the delivery location. Please try again.',
      };
      res.render('admin/adminDashboard.ejs', renderOptions);
    }
  },

};

export default addressController;