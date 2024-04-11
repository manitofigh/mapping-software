import DriverModel from './models/DriverModel.js';
// import AdminModel from './models/AdminModel.js';

// Create a driver with pending status
DriverModel.create('Driver User', 'driver@example.com', 'password', 'driver', 'pending');

// Create a driver with approved status
// DriverModel.create('Driver User', 'driver@example.com', 'password', 'driver', 'approved');

// Delete a driver
// DriverModel.delete('driver@example.com');

// Create an admin with pending status
// AdminModel.create('Admin User', 'admin@example.com', 'password', 'admin', 'pending');

// Create an admin with approved status
// AdminModel.create('Admin User', 'admin@example.com', 'password', 'admin', 'approved');

// Delete an admin
// AdminModel.delete('admin@example.com');