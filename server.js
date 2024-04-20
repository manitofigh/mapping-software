const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const multer = require('multer');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');


require("dotenv").config();
require('./passportConfig')(passport, pool);

const addressRoutes = require('./addressRoutes');
const prcoessingRoutes = require('./processingRoutes');
const upload = multer({ dest: 'uploads/' });

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
app.use('/', prcoessingRoutes);

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
app.use(bodyParser.json());


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

//Address input
app.post('/api/uploadaddresses', upload.single('file'), async(req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(req.file.destination, req.file.filename);
  console.log('Attempting to read file from:', filePath); // Debug: Log the file path

  try{
    const data = await fs.readFile(filePath, 'utf8');

    // Split the file content by new lines to get addresses
    const addresses = data.split('\n').filter(Boolean).map(address => address.trim());
    console.log('Addresses:', addresses); // Debug: Log addresses

    // using axios here
    await axios.post('http://localhost:3000/api/addresses', { addresses });

    res.send('Addresses processed successfully.');

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing file.');
  }
});



app.get("/api/itineary", checkNotAuthenticated, async (req, res) => {
  // Example: Return some dashboard data
  res.json({ message: "Data to be given" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
