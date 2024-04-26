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
    if (!req.body.address || !req.body.driverId) {
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        errorTitle: 'Error',
        errorBody: 'Please make sure you have selected a driver and entered an address.',
        previousAddress: req.body.address || '',
        previousDriverId: req.body.driverId || ''
      });
      return;
    }
  
    const { address, driverId } = req.body;
    const addressLines = address.split('\n').filter(line => line.trim() !== '');
  
    if (addressLines.length === 0) {
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        errorTitle: 'Error',
        errorBody: 'Please enter at least one valid address.',
        previousAddress: '',
        previousDriverId: driverId
      });
      return;
    }
  
    try {
      const driver = await AdminModel.getDriverById(driverId);
      if (!driver) {
        res.render('admin/adminDashboard.ejs', {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          drivers: await AdminModel.getDrivers(),
          errorTitle: 'Error',
          errorBody: 'Invalid driver selected.',
          previousAddress: address,
          previousDriverId: driverId
        });
        return;
      }
  
      const geocodedLocations = await Promise.all(addressLines.map(async (line) => {
        const cachedLocation = await AddressModel.getGeocodedLocation(line);
        if (cachedLocation) {
          return cachedLocation;
        } else {
          const geocodedResponse = await geocoder.geocode(line);
          if (geocodedResponse.length > 0) {
            const { latitude, longitude, formattedAddress } = geocodedResponse[0];
            const latLon = `${latitude},${longitude}`;
            await AddressModel.addGeocodedLocation(line, latLon, formattedAddress, 'valid');
            return { address: line, latLon, realAddress: formattedAddress, quality: 'valid' };
          } else {
            await AddressModel.addGeocodedLocation(line, null, null, 'invalid');
            return { address: line, latLon: null, realAddress: null, quality: 'invalid' };
          }
        }
      }));
  
      const validLocations = geocodedLocations.filter(location => location.quality === 'valid');
      const invalidLocations = geocodedLocations.filter(location => location.quality === 'invalid');
  
      await Promise.all(validLocations.map(async (location) => {
        await AddressModel.addDeliveryLocation(location.address, location.latLon, driver.email , driver.color, 'pending', authController.getFormattedTime());
      }));
  
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        successTitle: 'Addresses Added',
        successBody: `${validLocations.length} addresses were successfully added.`,
        errorTitle: invalidLocations.length > 0 ? 'Invalid Addresses' : undefined,
        errorBody: invalidLocations.length > 0 ? invalidLocations.map(location => location.address).join('\n') : undefined,
        previousAddress: '',
        previousDriverId: driverId
      });
    } catch (error) {
      console.error('Error adding addresses:', error);
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        errorTitle: 'Error Adding Addresses',
        errorBody: 'An error occurred while adding the addresses. Please try again.',
        previousAddress: address,
        previousDriverId: driverId
      });
    }
  },

  async deleteAddress(req, res) {
    const addressId = req.params.addressId;
    try {
      await AdminModel.deleteAddress(addressId);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error deleting address:', error);
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        errorTitle: 'Error Deleting Address',
        errorBody: 'An error occurred while deleting the address. Please try again.',
      });
    }
  },

};

export default addressController;