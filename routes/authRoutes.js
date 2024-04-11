import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role == 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (req.user.role == 'driver') {
      return res.redirect('/driver/dashboard');
    }
  }
  res.render('auth/login');
});

router.post('/login', authController.login);

router.post('/logout', authController.logout);

export default router;