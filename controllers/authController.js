import passport from '../config/passport.js';

const authController = {
  login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render('auth/login', { errorMessage: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        if (user.role === 'admin') {
          return res.redirect('/admin/dashboard');
        } else if (user.role === 'driver') {
          return res.redirect('/driver/dashboard');
        }
      });
    })(req, res, next);
  },

  logout(req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  },

  renderSignup(req, res) {
    res.render('auth/signup');
  },

  async signup(req, res) {
    try {
      const { name, email, password } = req.body;
      await DriverModel.create(name, email, password, 'driver', 'pending');
      res.render('auth/login', { status: 'success', message: 'Your application has been submitted successfully' });
    } catch (err) {
      console.error(err);
      res.render('auth/login', { status: 'error', message: 'An error occurred while submitting your application' });
    }
  },

  renderLogin(req, res) {
    if (req.isAuthenticated()) {
      if (req.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else if (req.user.role === 'driver') {
        return res.redirect('/driver/dashboard');
      }
    }
    res.render('auth/login', { errorMessage: req.query.error });
  },
};

export default authController;