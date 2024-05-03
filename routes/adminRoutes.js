import express from 'express';
import adminController from '../controllers/adminController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import addressController from '../controllers/addressController.js';

const router = express.Router();

router.get('/dashboard', isAuthenticated, isAdmin, adminController.renderDashboard);

router.get('/applications', isAuthenticated, isAdmin, adminController.renderApplications);
router.post('/applications/:id/approve', isAuthenticated, isAdmin, adminController.approveApplication);
router.post('/applications/:id/reject', isAuthenticated, isAdmin, adminController.rejectApplication);

router.get('/profile', isAuthenticated, isAdmin, adminController.renderProfile);
router.post('/profile/update-email', isAuthenticated, isAdmin, adminController.updateEmail);
router.post('/profile/update-password', isAuthenticated, isAdmin, adminController.updatePassword);
router.post('/profile/clean-database', isAuthenticated, isAdmin, adminController.cleanDatabase);

router.get('/drivers', isAuthenticated, isAdmin, adminController.getDrivers);
router.post('/drivers/:driverId/disable-account', isAuthenticated, isAdmin, adminController.disableAccount);
router.post('/drivers/:driverId/enable-account', isAuthenticated, isAdmin, adminController.enableAccount);
router.post('/drivers/:driverId/change-color', isAuthenticated, isAdmin, adminController.changeDriverColor);
router.get('/drivers/:driverId/history', isAuthenticated, isAdmin, adminController.getDriverHistory);

router.post('/submit-address', isAuthenticated, isAdmin, addressController.addAddress);
router.post('/remove-delivery-location', isAuthenticated, isAdmin, addressController.removeDeliveryLocation);
router.post('/create-trips', isAuthenticated, isAdmin, addressController.createTrips);

export default router;