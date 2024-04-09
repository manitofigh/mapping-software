import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/isAuthenticated.js';

const router = express.Router();

// Profile Route
router.get('/profile', authMiddleware.isAuthenticated, userController.getProfile);

// Settings Route
router.get('/settings', authMiddleware.isAuthenticated, userController.getSettings);

export default router;
