import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';
import { sendEmail } from '../utils/nodemailer.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const adminController = {
  async renderDashboard(req, res) {
    try {
      const pendingApplications = await AdminModel.countPendingApplications();
      res.render('admin/adminDashboard.ejs', { user: req.user, pendingApplications });
    } catch (err) {
      console.error(err);
      res.redirect('/admin/dashboard');
    }
  },
  
  async renderApplications(req, res) {
    try {
      const applications = await AdminModel.findPendingApplications();
      res.render('admin/applications.ejs', { applications, user: req.user });
    } catch (err) {
      console.error(err);
      res.redirect('/admin/dashboard');
    }
  },

  async approveApplication(req, res) {
    try {
      const applicationId = req.params.id;
      await AdminModel.updateStatus(applicationId, 'approved');
      const driver = await DriverModel.findById(applicationId);
      // sendEmail(to, subject, html)
      // random 8-letter long password for user to login after approval
      const password = Math.random().toString(36).slice(-8);
      await AdminModel.updateDriverPassword(driver.email, password);
      await sendEmail(
        // email
        driver.email, 
        // subject
        'Driver Application Approval', 
        // html
        `<h1>You have been approved, ${driver.name}!</h1>
        </br>
        <p>Congratulations! Your driver application has been approved. 
        </br>
        <p>Here are your credentials:</p>
        </br>
        <p>Email: ${driver.email}</p>
        </br>
        <p>Password: ${password}</p>
        </br>
        <strong style="color: red;">Please change your password right after logging in.</strong>
        </br>
        You can now login to the system at ${process.env.BASE_URL}:${process.env.PORT}</p>`
      );
      console.log(`Approval email sent to ${driver.email}`)

      res.render('admin/applications.ejs', { 
        user: req.user,
        applications: await AdminModel.findPendingApplications(),
        approvalSuccessMessage: `Approval Email sent to ${driver.email} successfully` 
      });
    } catch (err) {
      console.error(err);
      // req.flash('error', 'An error occurred while approving the application');
      res.redirect('admin/applications.ejs', { approvalErrorMessage: 'An error occurred while approving the application' });
    }
  },

  async rejectApplication(req, res) {
    try {
      const applicationId = req.params.id;
      const driver = await DriverModel.findById(applicationId);
      await sendEmail(driver.email, 'Application Rejected', 'Your driver application has been rejected.');
      console.log(`Rejection email sent to ${driver.email}`);
      await DriverModel.delete(driver.email);
      // req.flash('success', 'Application rejected successfully');
      res.redirect('/admin/applications');
    } catch (err) {
      console.error(err);
      // req.flash('error', 'An error occurred while rejecting the application');
      res.redirect('/admin/applications');
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
        await sendEmail(
          // email
          admin.email, 
          // subject
          'Password Reset', 
          // html
          `<h1>Your password has been reset, ${admin.name}!</h1>
          </br>
          <p>Your new password is: ${password}</p>
          </br>
          <strong style="color: red;">Please change your password right after logging in.</strong>
          </br>
          You can now login to the system at http://localhost:${process.env.PORT}</p>`
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
        errorTitle: 'Error Fetching Addresses',
        errorBody: 'An error occurred while fetching addresses for the selected driver. Please try again.',
      });
    }
  },

  async addAddress(req, res) {
    const { address, driverId } = req.body;
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
      const { lat, lng } = response.data.results[0].geometry.location;
      const newAddress = await AdminModel.addAddress(address, lat, lng, driverId);
      res.json(newAddress);
    } catch (error) {
      console.error('Error adding address:', error);
      res.render('admin/adminDashboard.ejs', {
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
        errorTitle: 'Error Deleting Address',
        errorBody: 'An error occurred while deleting the address. Please try again.',
      });
    }
  },
};

export default adminController;