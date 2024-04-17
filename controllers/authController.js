import passport from '../utils/passport.js';
import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';
import { sendMail } from '../utils/nodemailer.js';

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

  // post /signup 
  async signup(req, res) {
    try {
      const application = req.body;
      
      // Input sanitization and validation
      const nameRegex = /^[a-zA-Z\s,'-]{2,}$/; // At least 2 characters, allows letters, spaces, commas, apostrophes, and hyphens
      const zipRegex = /^\d{5}(-\d{4})?$/; // U.S. ZIP code, allows five digits or nine digits with hyphen (e.g., 12345-6789)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // Email address, broadly accepting 2-4 letter domain extensions
      const addressRegex = /^[a-zA-Z0-9\s,.'-]{3,}$/; // At least 3 characters, allows letters, numbers, spaces, commas, periods, apostrophes, and hyphens
      
      if (!nameRegex.test(application.firstName) || 
          !nameRegex.test(application.lastName) || 
          !zipRegex.test(application.zip) || 
          !emailRegex.test(application.email) || 
          !addressRegex.test(application.street) || 
          !addressRegex.test(application.city)) {
        res.render('auth/signup.ejs', { 
          status: 'error', 
          errorTitle: 'Error',
          errorBody: `All fields must be filled out correctly. 
                      Names must be at least 2 letters long with no special characters or numbers. 
                      Zip code must be exactly 5 digits. Email must be a valid email address. 
                      Street and city must be at least 3 characters long and are allowed letters, numbers, spaces, commas, periods, apostrophes, and hyphens.`
        });
      }
      // If about is empty, set it to N/A
      application.about = application.about === null || /^ *$/.test(application.about) ? "N/A" : application.about;
      
      await AdminModel.createApplication(application);
      await sendMail(
        // email
        application.email, 
        // subject
        'Application Submitted', 
        // html
        `<h1>We got your application, ${application.firstName} ${application.lastName}!</h1>
        </br>
        <p>Your application has been submitted successfully. 
        </br>
        You will be notified once an admin reviews your application.</p>`
      );
      res.render('auth/login.ejs', { 
        status: 'success', 
        successTitle: 'Application Submitted',
        successBody: 'Your will be notified once an admin reviews your application.' 
      });
    } catch (err) {
      console.error(err);
    }
  },

  // get /login
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

  // get /forgot-password
  renderForgotPassword(req, res) {
    res.render('auth/forgotPassword.ejs');
  },

  // post /forgot-password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await AdminModel.findUserByEmail(email);
      if (user) {
        // random 8-letter long password for user
        const password = Math.random().toString(36).slice(-8);
        await AdminModel.updateUserPassword(user.email, password);
        // sendMail(to, subject, html)
        await sendMail(
          // email
          user.email, 
          // subject
          'Password Reset', 
          // html
          `<h1>Your password has been reset, ${user.name}</h1>
          </br>
          <p>Your new password is: ${password}</p>
          </br>
          <strong style="color: red;">Please change your password right after logging in.</strong>
          </br>
          You can now login to the system at http://localhost:${process.env.PORT}</p>`
        );
        console.log(`Password reset email sent to ${user.email}`);
        res.render('auth/forgotPassword.ejs', { 
          status: 'success', 
          successTitle: 'Success', 
          successBody: 'Check your Email for the new password' 
        });
      } else {
        res.render('auth/forgotPassword.ejs', { 
          status: 'error', 
          errorTitle: 'Error',
          errorBody: 'No user found with that Email'});
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