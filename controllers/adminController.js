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
          activeTrips.push({ driverEmail: driver.email, deliveryJobs });
        }
      }
  
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: drivers,
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        activeTrips: activeTrips,
      });
    } catch (err) {
      console.error(err);

      const drivers = await AdminModel.getDrivers();
      const activeTrips = [];
      for (const driver of drivers) {
        const highestPendingTripNumber = await AddressModel.getHighestPendingTripNumberByDriverEmail(driver.email);
        if (highestPendingTripNumber) {
          const deliveryJobs = await AddressModel.getDeliveryJobsByDriverEmailAndTripNumber(driver.email, highestPendingTripNumber);
          activeTrips.push({ driverEmail: driver.email, deliveryJobs });
        }
      }

      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: drivers,
        pendingDeliveryLocations: await AddressModel.getPendingDeliveryLocations(),
        activeTrips: activeTrips,
        errorTitle: 'Error',
        errorBody: 'An error occurred while rendering your dashboard. Please try again.',
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
      res.render('admin/adminDashboard.ejs', { 
        user: req.user, 
        pendingApplications: await AdminModel.countPendingApplications(),
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

  async getDrivers(req, res) {
    try {
      const drivers = await AdminModel.getDrivers();
      res.json(drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);

      res.status(500).json({
        error: 'An error occurred while fetching drivers',
      });
    }
  },
};

export default adminController;