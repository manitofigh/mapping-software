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

  async renderHistory(req, res) {
    try {
      const driverEmail = req.user.email;
      const completedTripNumbers = await AddressModel.getCompletedTripNumbers(driverEmail);
  
      const completedTrips = [];
      for (const tripNumber of completedTripNumbers) {
        const deliveryJobs = await AddressModel.getDeliveryJobsByTripNumber(driverEmail, tripNumber);
        completedTrips.push({ tripNumber, deliveryJobs });
      }
  
      res.render('driver/driverHistory.ejs', {
        user: req.user,
        completedTrips: completedTrips,
      });
    } catch (err) {
      console.error(err);
      res.render('driver/driverHistory.ejs', {
        user: req.user,
        completedTrips: [],
        errorTitle: 'Error',
        errorBody: 'An error occurred while fetching the trip history. Please try again.',
      });
    }
  },

  async renderProfile(req, res) {
    res.render('driver/profile.ejs', {
      user: req.user,
    });
  },
  
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const driver = await DriverModel.findDriverByEmail(req.user.email);
      const newPasswordAndConfirmPasswordMatch = newPassword === confirmPassword;
      const currentPasswordMatches = await authController.comparePasswords(currentPassword, driver.password);
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
      const newPasswordMatchesRegex = passwordRegex.test(newPassword);
  
      if (newPasswordAndConfirmPasswordMatch && currentPasswordMatches && newPasswordMatchesRegex) {
        await DriverModel.updatePasswordById(driver.id, newPassword);
        res.render('driver/profile.ejs', {
          user: req.user,
          successTitle: 'Success',
          successBody: 'Password updated successfully',
        });
      } else if (!newPasswordAndConfirmPasswordMatch) {
        res.render('driver/profile.ejs', {
          user: req.user,
          errorTitle: 'Error',
          errorBody: 'New password and confirm password do not match',
        });
      } else if (!currentPasswordMatches) {
        res.render('driver/profile.ejs', {
          user: req.user,
          errorTitle: 'Error',
          errorBody: 'Current password is incorrect',
        });
      } else if (!newPasswordMatchesRegex) {
        res.render('driver/profile.ejs', {
          user: req.user,
          errorTitle: 'Error',
          errorBody: 'New password must contain at least one special character, one uppercase, one number, and at least 8 letters long',
        });
      }
    } catch (err) {
      console.error(err);
      res.render('driver/profile.ejs', {
        user: req.user,
        errorTitle: 'Error',
        errorBody: 'An error occurred while updating your password. Please try again.',
      });
    }
  },

};

export default driverController;