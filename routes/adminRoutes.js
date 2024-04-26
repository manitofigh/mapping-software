import express from 'express';
import adminController from '../controllers/adminController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.get('/dashboard', isAuthenticated, isAdmin, adminController.renderDashboard);

router.get('/applications', isAuthenticated, isAdmin, adminController.renderApplications);
router.post('/applications/:id/approve', isAuthenticated, isAdmin, adminController.approveApplication);
router.post('/applications/:id/reject', isAuthenticated, isAdmin, adminController.rejectApplication);

router.get('/drivers', isAuthenticated, isAdmin, adminController.getDrivers);
router.get('/drivers/:driverId/addresses', isAuthenticated, isAdmin, adminController.getAddressesForDriver);
router.post('/submit-address', isAuthenticated, isAdmin, adminController.addAddress);
router.delete('/submit-address/:addressId', isAuthenticated, isAdmin, adminController.deleteAddress);

export default router;