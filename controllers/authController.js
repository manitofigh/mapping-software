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
};

export default authController;