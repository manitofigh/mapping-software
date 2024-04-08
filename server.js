const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
require('./passportConfig')(passport, pool);
const addressRoutes = require('./addressRoutes');
const app = express();

app.use(express.json());
const PORT = process.env.PORT; // Set this in your .env file

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET, // Set this in your .env file
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', addressRoutes);

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET, // Set this in your .env file
    // Should we resave our session variables if nothing has changes (we dont)
    resave: false,
    // Save empty value if there is no vaue (we dont)
    saveUninitialized: false
  })
);
//initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session
app.use(passport.session());
app.use(flash());


app.get("/users/logout", (req, res) => {
  req.logout(req.user, err=>{
    if(err) return next(err);
  });
  res.render("index", { message: "You have logged out successfully" });
});

app.post("/users/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;

  let errors = [];

  //validation
  if (!name || !email || !password || !password2) {
      errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
      errors.push({ message: "Password must be at least 6 characters long" });
  }

  if (password !== password2) {
      errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
      // If there are errors, send them back to the client
      res.status(400).json({ errors });
  } else {
      // Validation passed
      try {
          const hashedPassword = await bcrypt.hash(password, 10);
          // Check if user already exists
          const userExists = await pool.query(
              `SELECT * FROM users WHERE email = $1`,
              [email]
          );

          if (userExists.rows.length > 0) {
              // User already exists
              errors.push({ message: "Email already registered" });
              res.status(400).json({ errors });
          } else {
              // Insert new user
              const newUser = await pool.query(
                  `INSERT INTO users (name, email, password)
                  VALUES ($1, $2, $3) RETURNING id, name, email`,
                  [name, email, hashedPassword]
              );

              if (newUser.rows.length > 0) {
                  // Successfully created user
                  res.status(201).json({ user: newUser.rows[0] });
              } else {
                  // Just in case the insertion fails
                  res.status(500).json({ message: "Failed to register user" });
              }
          }
      } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Server error during registration" });
      }
  }
});

app.post('/users/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err;
        if (!user) res.status(401).send(info.message);
        else {
            req.logIn(user, (err) => {
                if (err) throw err;
                res.status(200).send('Successfully Authenticated');
            });
        }
    })(req, res, next);
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.status(403).json({ message: "Already authenticated" });
  }
  next();
}


function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

app.get("/api/itineary", checkNotAuthenticated, async (req, res) => {
  // Example: Return some dashboard data
  res.json({ message: "Data to be given" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
