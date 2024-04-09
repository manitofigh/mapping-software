import express from 'express';
import adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/isAuthenticated.js';

const router = express.Router();

// Admin Dashboard: Main entry point after successful login
router.get('/dashboard', authMiddleware.isAuthenticated, authMiddleware.isAdmin, adminController.dashboard);

// Manage Users: Page for viewing and managing system users
router.get('/users', authMiddleware.isAuthenticated, authMiddleware.isAdmin, adminController.manageUsers);

// System Settings: Page for adjusting system-wide settings
router.get('/settings', authMiddleware.isAuthenticated, authMiddleware.isAdmin, adminController.systemSettings);

export default router;
