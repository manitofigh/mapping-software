import passport from '../utils/passport.js';
import DriverModel from '../models/DriverModel.js';
import { sendEmail } from '../utils/nodemailer.js';
import { render } from 'ejs';

const authController = {
  login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        console.log(`INFO MESSAGE: ${info.message}`);
        return res.render('auth/login.ejs', { 
          status: 'error',
          errorTitle: 'Error',
          errorBody: 'Invalid Email or password'
         });
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
    res.render('auth/signup.ejs');
  },

  async signup(req, res) {
    try {
      const { name, email } = req.body;
      // random 8-letter long password for now
      const tempPassword = Math.random().toString(36).slice(-8);
      await DriverModel.create(name, email, tempPassword, 'driver', 'pending');
      res.render('auth/login.ejs', { 
        status: 'success', 
        successTitle: 'Application Submitted',
        successBody: 'Your will be notified once an admin reviews your application.' 
      });
    } catch (err) {
      console.error(err);
      res.render('auth/login.ejs', { 
        status: 'error', 
        errorTitle: 'Error',
        errorBody: 'An error occurred while submitting your application.' });
    }
  },

  renderLogin(req, res) {
    if (req.isAuthenticated()) {
      if (req.user.role == 'admin') {
        return res.redirect('/admin/dashboard');
      } else if (req.user.role == 'driver') {
        return res.redirect('/driver/dashboard');
      }
    }
    res.render('auth/login.ejs', { 
      errorTitle: 'Error',
      errorBody: req.query.error 
    });
  },

  renderForgotPassword(req, res) {
    res.render('auth/forgotPassword.ejs');
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const driver = await DriverModel.findByEmail(email);
      if (driver) {
        // random 8-letter long password for user to login after approval
        const password = Math.random().toString(36).slice(-8);
        await DriverModel.updateDriverPassword(driver.email, password);
        // sendEmail(to, subject, html)
        await sendEmail(
          // email
          driver.email, 
          // subject
          'Password Reset', 
          // html
          `<h1>Your password has been reset, ${driver.name}!</h1>
          </br>
          <p>Your new password is: ${password}</p>
          </br>
          <strong style="color: red;">Please change your password right after logging in.</strong>
          </br>
          You can now login to the system at http://localhost:${process.env.PORT}</p>`
        );
        console.log(`Password reset email sent to ${driver.email}`);
        res.render('auth/forgotPassword.ejs', { 
          status: 'success', 
          successTitle: 'Done', 
          successBody: 'Check your email for the new password' });
      } else {
        res.render('auth/forgotPassword.ejs', { 
          status: 'error', 
          errorTitle: 'Error',
          errorBody: 'No user found with that email'});
      }
    } catch (err) {
      console.error(err);
      res.render('auth/forgotPassword.ejs', { status: 'error', errorTitle: 'Error', errorBody: 'An error occurred while resetting the password' });
    }
  },

  render404(req, res) {
    res.render('auth/404.ejs');
  }

};

export default authController;