import passport from '../utils/passport.js';
import bcrypt from 'bcrypt';
// import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';
import { sendMail } from '../utils/nodemailer.js';

const authController = {
  generatePassword() {
    const charset = "abcdefghijklmnopqrstuvwxyz";
    const specialChars = "!@#$%^&*()_+";
    let password = "";
  
    // Generate a random uppercase letter
    password += charset[Math.floor(Math.random() * charset.length)].toUpperCase();
  
    // Generate a random special character
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
    // Generate a random number
    password += Math.floor(Math.random() * 10);
  
    // Generate remaining lowercase letters
    for (let i = 0; i < 5; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
  
    // Shuffle the password characters
    password = password.split("").sort(() => Math.random() - 0.5).join("");
  
    return password;
  },

  // Get current formatted time
  getFormattedTime() {
    const currentDate = new Date();
    const datePart = currentDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = currentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
    return `${datePart} at ${timePart}`;
  },

  // POST /login
  login(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        if (user.status === 'disabled') {
          return res.render('auth/login.ejs', { 
            status: 'error',
            errorTitle: 'Error',
            errorBody: 'Your account has been disabled. Please contact the administrator for further information.'
          });
        }
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

  // POST /logout
  logout(req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  },

  // GET /signup
  renderSignup(req, res) {
    res.render('auth/signup.ejs');
  },

  // POST /signup 
  async signup(req, res) {
    try {
      const application = req.body;
      
      // Input sanitization and validation
      const nameRegex = /^[a-zA-Z\s,'-]{2,}$/; // At least 2 characters, allows letters, spaces, commas, apostrophes, and hyphens
      const zipRegex = /^\d{5}$/; // U.S. ZIP code, exactly five digits
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/; // No dashes at start/end of domain and allows any number of characters for TLD.
      const addressRegex = /^[a-zA-Z0-9\s,.'-]{3,}$/; // At least 3 characters, allows letters, numbers, spaces, commas, periods, apostrophes, and hyphens
      
      if (!nameRegex.test(application.firstName) || 
          !nameRegex.test(application.lastName) || 
          !zipRegex.test(application.zip) || 
          !emailRegex.test(application.email) || 
          !addressRegex.test(application.street) || 
          !addressRegex.test(application.city)) 
      {
        return res.render('auth/signup.ejs', { 
          status: 'error', 
          errorTitle: 'Error',
          errorBody: `All fields must be filled out correctly.
                      Names must be at least 2 letters long with no special characters or numbers. 
                      Zip code must be exactly 5 digits long. 
                      Email must be a valid email address.
                      Street and city must be at least 3 characters long and are allowed letters, numbers, spaces, commas, periods, apostrophes, and hyphens.`
        });
      }

      // If about is empty, set it to N/A
      application.about = application.about === null || /^ *$/.test(application.about) ? "N/A" : application.about;
      
      // Create user but with pending status
      // createUser(firstName, lastName, email, password, status, role, country, city, state, zip, street, about, color, createTime)
      await AdminModel.createUser(
        application.firstName,
        application.lastName,
        application.email,
        authController.generatePassword(),
        'pending',
        'driver',
        application.country,
        application.city,
        application.state,
        application.zip,
        application.street,
        application.about,
        null,
        authController.getFormattedTime()
      );
      await sendMail(
        // email
        application.email, 
        // subject
        'Application Submitted', 
        // html
        `<h1 style="color: #b45309">We got your application, ${application.firstName} ${application.lastName}!</h1>
        <p>Your application has been submitted successfully.</p> 
        <p>You will be notified on the status of your application upon an administrator's review.</p>`
      );
      res.render('auth/login.ejs', { 
        status: 'success', 
        successTitle: 'Application Submitted',
        successBody: 'Please check your Email for confirmation.' 
      });
    } catch (err) {
      console.error(err);
      res.render('auth/signup.ejs', { 
        status: 'error', 
        errorTitle: 'Error',
        errorBody: `An error occurred while submitting the application.
                    Make sure you have not already submitted an application with this email address.`
      });
    }
  },

  async comparePasswords(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // GET /login
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