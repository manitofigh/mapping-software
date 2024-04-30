import AddressModel from "../models/AddressModel.js";
import authController from "./authController.js";
import DriverModel from "../models/DriverModel.js";

const driverController = {

  async renderDashboard(req, res) {
    try {
      const driverEmail = req.user.email;
      const activeTrip = await AddressModel.getActiveTrip(driverEmail);
      const geometry = await AddressModel.getRouteGeometriesByEmail(driverEmail);
      const mapPinpoints = await AddressModel.getAssignedDeliveryLocationsByEmail(driverEmail);
  
      // console.log('Active Trip:', activeTrip);
      // console.log('Geometry:', geometry);
      // console.log('Map Pinpoints:', mapPinpoints);
  
      res.render('driver/driverDashboard.ejs', { 
        user: req.user,
        geometry: geometry,
        mapPinpoints: mapPinpoints,
        activeTrip: activeTrip
      });
    } catch (err) {
      console.error(err);
      res.render('driver/driverDashboard.ejs', { 
        user: req.user,
        geometry: null,
        mapPinpoints: null,
        activeTrip: null
      });
    }
  },

  async startTrip(req, res) {
    try {
      const { driverEmail, tripNumber } = req.body;
      const trip = await AddressModel.getActiveTrip(driverEmail);
      if (trip) {
        await AddressModel.updateRouteStatus(driverEmail, tripNumber, 0, 'started');
        await AddressModel.stampStartTime(driverEmail, tripNumber, 0, authController.getFormattedTime());
  
        // Update the status of the next route (if available) to "pending"
        if (trip.deliveryJobs.length > 1) {
          await AddressModel.updateRouteStatus(driverEmail, tripNumber, 1, 'pending');
        }
      }
      res.redirect('/driver/dashboard');
    } catch (error) {
      console.error(error);
      res.redirect('/driver/dashboard');
    }
  },
  
  async markComplete(req, res) {
    try {
      const { driverEmail, tripNumber, waypointIndex } = req.body;
      const trip = await AddressModel.getActiveTrip(driverEmail);
      if (trip) {
        await AddressModel.updateRouteStatus(driverEmail, tripNumber, waypointIndex, 'completed');
        await AddressModel.stampEndTime(driverEmail, tripNumber, waypointIndex, authController.getFormattedTime());
  
        const nextWaypointIndex = parseInt(waypointIndex) + 1;
        if (nextWaypointIndex < trip.deliveryJobs.length) {
          await AddressModel.updateRouteStatus(driverEmail, tripNumber, nextWaypointIndex, 'started');
          await AddressModel.stampStartTime(driverEmail, tripNumber, nextWaypointIndex, authController.getFormattedTime());
        } else {
          await AddressModel.updateTripStatus(driverEmail, tripNumber, 'completed');
        }
      }
      res.redirect('/driver/dashboard');
    } catch (error) {
      console.error(error);
      res.redirect('/driver/dashboard');
    }
  },

};

export default driverController;