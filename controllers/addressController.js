import DriverModel from '../models/DriverModel.js';
import AdminModel from '../models/AdminModel.js';
import authController from './authController.js';
import { sendMail } from '../utils/nodemailer.js';
import nodeGeocoder from 'node-geocoder';
import axios from 'axios';
import _ from lodash;
import dotenv from 'dotenv';

dotenv.config();

const options = {
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
};
  
const geocoder = nodeGeocoder(options);



