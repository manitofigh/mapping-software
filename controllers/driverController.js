import AddressModel from "../models/AddressModel.js";
import authController from "./authController.js";
import DriverModel from "../models/DriverModel.js";

const driverController = {

  async renderDashboard(req, res) {
    try {
      const driverEmail = req.user.email;
      const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driverEmail);
      
      if (highestPendingTripNumber) {
        const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driverEmail, highestPendingTripNumber);
        const tripGeometry = await AddressModel.getTripGeometryByDriverEmailAndTripNumber(driverEmail, highestPendingTripNumber);
        
        res.render('driver/driverDashboard.ejs', { 
          user: req.user,
          activeTrip: {
            driverEmail: driverEmail,
            deliveryJobs: deliveryJobs,
            tripGeometry: tripGeometry
          }
        });
      } else {
        res.render('driver/driverDashboard.ejs', { 
          user: req.user,
          activeTrip: null
        });
      }
    } catch (err) {
      console.error(err);
      res.render('driver/driverDashboard.ejs', { 
        user: req.user,
        activeTrip: null,
        errorTitle: 'Error',
        errorBody: 'An error occurred while rendering your dashboard. Please try again.',
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