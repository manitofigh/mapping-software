import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours in ms
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// Redirection Middleware
app.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login'); // Redirect all unauthenticated requests to login
  }
  next(); // next mw if authenticated
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});