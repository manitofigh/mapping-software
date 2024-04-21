import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';
import authController from './authController.js';
import { sendMail } from '../utils/nodemailer.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const adminController = {
  async renderDashboard(req, res) {
    try {
      res.render('admin/adminDashboard.ejs', { 
        user: req.user, 
        pendingApplications: await AdminModel.countPendingApplications(), 
        drivers: await AdminModel.getDrivers() 
      });
    } catch (err) {
      console.error(err);
      res.render('admin/adminDashboard.ejs', { 
        user:req.user,
        pendingApplidations: await AdminModel.countPendingApplications(),
        errorTitle: 'Error',
        errorBody: 'An error occurred while rendering your dashboard. Please try again.' 
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
        user: user.req, 
        pendingApplications: await AdminModel.countPendingApplications(),
        errorTitle: 'Error', 
        errorBody: 'An error occurred while rendering the applications. Please try again.' });
    }
  },

  async approveApplication(req, res) {
    try {
      const applicationId = req.params.id;
      const application = await AdminModel.findApplicationById(applicationId);
  
      await AdminModel.updateStatus(applicationId, 'approved');
  
      // random 8-letter long password for user to login after approval
      const password = authController.generatePassword();
      const driver = await DriverModel.create(`${application.first_name} ${application.last_name}`, application.email, password, 'driver', 'approved');
  
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
        <strong style="color: red;">Please change your password right after logging in.</strong>
        You can now login to the system at ${process.env.BASE_URL}:${process.env.PORT}</p>`
      );
      console.log(`Approval email sent to ${application.email}`)
  
      res.render('admin/applications.ejs', { 
        user: req.user,
        applications: await AdminModel.findPendingApplications(),
        successTitle: 'Approved successfully',
        successBody: `Approval Email sent to ${driver.email} successfully` 
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
      `<h1>Dear, ${application.first_name}!</h1>
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
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        errorTitle: 'Error Fetching Drivers',
        errorBody: 'An error occurred while fetching the drivers. Please try again.',
      });
    }
  },

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
    // input sanitization and validation
    if (!req.body.address || !req.body.driverId) {
      res.render('admin/adminDashboard.ejs', {
      user: req.user,
      pendingApplications: await AdminModel.countPendingApplications(),
      drivers: await AdminModel.getDrivers(),
      errorTitle: 'Error',
      errorBody: 'Please make sure you have chose a driver and entered an address.',
      });
      return;
    }
    const { address, driverId } = req.body;
    try {
      console.log(`Address received: ${address} for driverId: ${driverId}`);
      const geocodedResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
      const { lat, lng } = geocodedResponse.data.results[0].geometry.location;
      console.log(`Lat Lng for ${address} is: ${lat}, ${lng}`);
      const newAddress = await AdminModel.addAddress(address, lat, lng, driverId);
      res.json(newAddress);
    } catch (error) {
      console.error('Error adding address:', error);
      res.render('admin/adminDashboard.ejs', {
        user: req.user,
        pendingApplications: await AdminModel.countPendingApplications(),
        drivers: await AdminModel.getDrivers(),
        errorTitle: 'Error Adding Address',
        errorBody: 'An error occurred while adding the address. Please try again.',
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

export default adminController;