import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 }, // 2 days in ms
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/driver', driverRoutes);

const PORT = process.env.PORT
app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});