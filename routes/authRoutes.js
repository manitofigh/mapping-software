import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Login Route
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Registration Route
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

// Logout Route
router.get('/logout', authController.logout);

// // Password Reset Routes
// router.get('/reset', authController.getReset);
// router.post('/reset', authController.postReset);

export default router;
