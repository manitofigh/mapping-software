import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import passport from './utils/passport.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import authController from './controllers/authController.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/driver', driverRoutes);
app.use('*', authController.render404);

const PORT = process.env.PORT
const BASE_URL = process.env.BASE_URL
app.listen(process.env.PORT, () => {
  console.log(`Server is running at ${BASE_URL || 'http://localhost'}:${PORT || 3000}`);
});