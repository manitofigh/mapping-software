import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';
import authController from './authController.js';
import AddressModel from '../models/AddressModel.js';
import { sendMail } from '../utils/nodemailer.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const adminController = {

  async renderDashboard(req, res) {
    try {
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
  
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        drivers: drivers,
        activeTrips: activeTrips,
      });
    } catch (err) {
      console.error(err);
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: drivers,
        activeTrips: [],
        errorTitle: 'Error',
        errorBody: 'An error occurred while rendering your dashboard. Please try again.',
      });
    }
  },

  async renderProfile(req, res) {
    try {
      res.render('admin/profile.ejs', { 
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        error: 'An error occurred while rendering the profile' 
      });
    }
  },

  async updateEmail(req, res) {
    try {
      const { email } = req.body;
      await AdminModel.updateEmailByEmail(req.user.email, email);
      res.render('admin/profile.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        successTitle: 'Success',
        successBody: 'Email updated successfully. You need to refresh your page for the changes to take effect as your previous session is still using the old email.',
      });
    } catch (err) {
      console.error(err);
      res.render('admin/profile.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while updating the email',
      });
    }
  },

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const admin = await AdminModel.findUserByEmail(req.user.email);
      const newPasswordAndConfirmPasswordMatch = newPassword === confirmPassword;
      const currentPasswordMatches = await authController.comparePasswords(currentPassword, admin.password);
      // email regex to contain at least one special character, one uppercase, one number, and at least 8 letters long
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
      const newPasswordMatchesRegex = passwordRegex.test(newPassword);

      // if new password and confirm password match, current password matches, and new password matches regex
      if (newPasswordAndConfirmPasswordMatch && currentPasswordMatches && newPasswordMatchesRegex) {
        await AdminModel.updatePasswordById(admin.id, newPassword);
        res.render('admin/profile.ejs', {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          successTitle: 'Success',
          successBody: 'Password updated successfully',
        });
      } else if (!newPasswordAndConfirmPasswordMatch) { // if new password and confirm password do not match
        res.render('admin/profile.ejs', {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          errorTitle: 'Error',
          errorBody: 'New password and confirm password do not match',
        });
      } else if (!currentPasswordMatches) { // if current password does not match
        res.render('admin/profile.ejs', {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          errorTitle: 'Error',
          errorBody: 'Current password is incorrect',
        });
      } else if (!newPasswordMatchesRegex) { // if new password does not match regex
        res.render('admin/profile.ejs', {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          errorTitle: 'Error',
          errorBody: 'New password must contain at least one special character, one uppercase, one number, and at least 8 letters long',
        });
      }
    } catch (err) { 
      console.error(err);
      res.render('admin/profile.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while updating the password',
      });
    }
  },

  async cleanDatabase(req, res) {
    try {
      await AdminModel.cleanDatabase();
      res.render('admin/profile.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        successTitle: 'Success',
        successBody: 'Database cleaned successfully',
      });
    } catch (err) {
      console.error(err);
      res.render('admin/profile.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while cleaning the database',
      });
    }
  },

  async getDrivers(req, res) {
    try {
      const drivers = await AdminModel.getDrivers();
      res.render('admin/viewDrivers.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: drivers,
      });
    } catch (error) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({
        error: 'An error occurred while fetching drivers. Please try again later.',
      });
    }
  },

  async disableAccount(req, res) {
    try {
      const driverId = req.params.driverId;
      await AdminModel.updateStatus(driverId, 'disabled');
      res.render('admin/viewDrivers.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        successTitle: 'Success',
        successBody: 'Driver account disabled successfully',
      });
    } catch (error) {
      console.error('Error disabling driver account:', error);
      res.render('admin/viewDrivers.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while disabling the driver account. Please try again later.',
      });
    }
  },
  
  async enableAccount(req, res) {
    try {
      const driverId = req.params.driverId;
      await AdminModel.updateStatus(driverId, 'approved');
      res.render('admin/viewDrivers.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        successTitle: 'Success',
        successBody: 'Driver account enabled successfully',
      });
    } catch (error) {
      console.error('Error enabling driver account:', error);
      res.render('admin/viewDrivers.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while enabling the driver account. Please try again later.',
      });
    }
  },

  async getDriverHistory(req, res) {
    try {
      const driverId = req.params.driverId;
      const driver = await AdminModel.getDriverById(driverId);
      const completedTripNumbers = await AddressModel.getCompletedTripNumbers(driver.email);
  
      const completedTrips = [];
      for (const tripNumber of completedTripNumbers) {
        const deliveryJobs = await AddressModel.getDeliveryJobsByTripNumber(driver.email, tripNumber);
        completedTrips.push({ tripNumber, deliveryJobs });
      }
  
      res.render('admin/driverHistory.ejs', {
        user: req.user,
        driver: driver,
        pendingApplications: await AdminModel.countPendingApplications(),
        completedTrips: completedTrips,
      });
    } catch (err) {
      console.error(err);
      res.render('admin/driverHistory.ejs', {
        user: req.user,
        driver: null,
        completedTrips: [],
        pendingApplications: await AdminModel.countPendingApplications(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while fetching the driver\'s trip history. Please try again.',
      });
    }
  },

  async changeDriverColor(req, res) {
    try {
      const driverId = req.params.driverId;
      const { color } = req.body;
      const driver = await AdminModel.getDriverById(driverId);
      
      if (driver) {
        await AdminModel.updateDriverColor(driver.email, color);
        res.render('admin/viewDrivers.ejs', {
          user: req.user,
          pendingApplications: await AdminModel.countPendingApplications(),
          drivers: await AdminModel.getDrivers(),
          successTitle: 'Success',
          successBody: `Driver color changed to ${color} successfully.`,
        });
      } else {
        res.status(404).json({ error: 'Driver not found' });
      }
    } catch (error) {
      console.error('Error changing driver color:', error);
      res.render('admin/viewDrivers.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while changing the driver color. Please try again later.',
      });
    }
  },
  
  async renderApplications(req, res) {
    try {
      res.render('admin/applications.ejs', { 
        user: req.user,
        applications : await AdminModel.findPendingApplications()
      });
    } catch (err) {
      console.error(err);
      res.render('admin/applications.ejs', { 
        user: req.user, 
        pendingApplications: [],
        errorTitle: 'Error', 
        errorBody: 'An error occurred while rendering the applications. Please try again.' });
    }
  },

  // After user gets approved
  async approveApplication(req, res) {
    try {
      const applicationId = req.params.id;
      const application = await AdminModel.findApplicationById(applicationId);
  
      // random 8-letter long password for user to login after approval
      const password = authController.generatePassword();
      await DriverModel.updateDriverPassword(application.email, password);
      // update status to approved so they can sign in
      await AdminModel.updateStatus(applicationId, 'approved');
  
      // sendMail(to, subject, html)
      await sendMail(
        // email
        application.email, 
        // subject
        'Driver Application Approval', 
        // html
        `<h1>You have been approved, ${application.first_name}!</h1>
        </br>
        <p>Congratulations! Your driver application has been approved. 
        </br>
        <p>Here are your credentials:</p>
        <p>Email: ${application.email}</p>
        <p>Password: ${password}</p>
        </br>
        <strong style="display: block; color: red;">Please change your password right after logging in.</strong>
        You can now login to the system at ${process.env.BASE_URL}:${process.env.PORT}</p>`
      );
      console.log(`Approval email sent to ${application.email}`)
  
      res.render('admin/applications.ejs', { 
        user: req.user,
        applications: await AdminModel.findPendingApplications(),
        successTitle: 'Approved successfully',
        successBody: `Approval Email sent to ${application.email} successfully` 
      });
    } catch (err) {
      console.error(err);
      res.render('admin/applications.ejs', { 
        user: req.user,
        applications: await AdminModel.findPendingApplications(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while approving the application' 
      });
    }
  },

  async rejectApplication(req, res) {
   try {
    const applicationId = req.params.id;
    const application = await AdminModel.findApplicationById(applicationId);
    await AdminModel.updateStatus(applicationId, 'rejected');
    
    await sendMail(
      // email
      application.email,
      // subject
      'Driver Application Rejection',
      // html
      `<h1 style="color: #b45309">Dear, ${application.first_name}!</h1>
      <p>We regret to inform you that your driver application has been rejected. 
      </br>
      <p>For further details, please contact su directly.</p>`
    );

    res.render('admin/applications.ejs', {
      user: req.user,
      applications: await AdminModel.findPendingApplications(),
      successTitle: 'Rejected successfully',
      successBody: `Rejection Email sent to ${application.email} successfully`
    });
    
  } catch (err) {
    console.error(err);
    res.render('admin/applications.ejs', { 
      user: req.user,
      applications: await AdminModel.findPendingApplications(),
      errorTitle: 'Error',
      errorBody: 'An error occurred while rejecting the application' 
    });
  }
  },

  async resetUserPassword(req, res) {
    try {
      const { email } = req.body;
      const admin = await AdminModel.findUserByEmail(email);
      if (admin) {
        // random 8-letter long password for user to login after approval
        const password = Math.random().toString(36).slice(-8);
        await AdminModel.updateAdminPassword(admin.email, password);
        await sendMail(
          // email
          admin.email, 
          // subject
          'Password Reset', 
          // html
          `
          <h1>Your password has been reset, ${admin.name}!</h1>
          </br>
          <p>Your new password is: ${password}</p>
          </br>
          <strong style="color: red;">Please change your password right after logging in.</strong>
          </br>
          You can now login to the system at http://localhost:${process.env.PORT}</p>
          `
        );
        console.log(`Password reset email sent to ${admin.email}`);
        res.render('admin/resetPassword.ejs', { 
          status: 'success', 
          successTitle: 'Success', 
          successBody: 'Check your Email for the new password' });
      } else {
        res.render('admin/resetPassword.ejs', { 
          status: 'error', 
          errorTitle: 'Error',
          errorBody: 'User not found' });
      }
    } catch (err) {
      console.error(err);
      res.render('admin/resetPassword.ejs', { 
        status: 'error', 
        errorTitle: 'Error',
        errorBody: 'An error occurred while resetting the password' });
    }
  },
};

export default adminController;