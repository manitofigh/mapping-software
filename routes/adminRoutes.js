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

router.get('/drivers', isAuthenticated, isAdmin, adminController.getDrivers);
router.get('/drivers/:driverId/addresses', isAuthenticated, isAdmin, addressController.getAddressesForDriver);
router.post('/submit-address', isAuthenticated, isAdmin, addressController.addAddress);
router.post('/remove-delivery-location', isAuthenticated, isAdmin, addressController.removeDeliveryLocation);
router.post('/create-trips', isAuthenticated, isAdmin, addressController.createTrips);

export default router;