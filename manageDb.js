import DriverModel from './models/DriverModel.js';
import AdminModel from './models/AdminModel.js';
import authController from './controllers/authController.js';

// Create users with different statuses
/*
AdminModel.createUser(
    'FirstName', 
    'LastName', 
    'example@email.com', 
    'password', 
    'approved'|| 'pending' || 'disabled', 
    'driver' || 'admin', 
    'USA', 
    'City', 
    'NY', 
    12345, 
    'Somewhere in NY', 
    'I want a car too', 
    'red', 
    authController.getFormattedTime()
)
*/

// update driver password
// DriverModel.updateDriverPassword('example@email.com', 'test123');

// Update driver status
// DriverModel.updateStatus('john@example.com', 'approved');
// DriverModel.updateStatus('jane@example.com', 'inactive');

// Delete a driver
// DriverModel.delete('mike@example.com');

// Update admin status
// AdminModel.updateStatus('admin2@example.com', 'approved');

// Delete an admin
// AdminModel.delete('admin1@example.com');

// Create addresses for different drivers
// AddressModel.create('123 Main St, City', 40.7128, -74.0060, 1);
// AddressModel.create('456 Elm St, Town', 37.7749, -122.4194, 1);
// AddressModel.create('789 Oak St, Village', 51.5074, -0.1278, 2);
// AddressModel.create('321 Maple Ave, Borough', 41.8781, -87.6298, 2);

// Update address status
// AddressModel.updateStatus(1, 'inactive');
// AddressModel.updateStatus(3, 'inactive');

