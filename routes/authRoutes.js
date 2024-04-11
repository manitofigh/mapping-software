import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/login');
});

// ## /login handlers START ## 
router.get('/login', authController.renderLogin);
router.post('/login', authController.login);
// ## /login handlers END ##

router.post('/logout', authController.logout);

router.get('/signup', authController.renderSignup);
router.post('/signup', authController.signup);

export default router;