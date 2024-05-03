import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/', authController.renderLogin);

router.get('/login', authController.renderLogin);
router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.get('/signup', authController.renderSignup);
router.post('/signup', authController.signup);

router.get('/forgot-password', authController.renderForgotPassword);
router.post('/forgot-password', authController.forgotPassword);

router.get('/404', authController.render404);

export default router;