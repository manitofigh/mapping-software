import express from 'express';
import adminController from '../controllers/adminController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.get('/dashboard', isAuthenticated, isAdmin, adminController.renderDashboard);
// Add other admin routes as needed

export default router;