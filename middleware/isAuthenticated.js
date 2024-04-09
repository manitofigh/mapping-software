import adminModel from '../models/adminModel.js';

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login'); // Redirect to login if not authenticated
};

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const email = req.user.email;
    const isUserAdmin = await adminModel.isAdmin(email);
    if (isUserAdmin) {
      return next();
    } else {
      res.status(403).send('Access denied. Admins only.'); // or redirect as per your handling strategy
    }
  } else {
    res.redirect('/auth/login');
  }
};

export default {
  isAuthenticated,
  isAdmin
};
