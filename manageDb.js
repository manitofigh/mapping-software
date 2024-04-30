import DriverModel from './models/DriverModel.js';
import AdminModel from './models/AdminModel.js';
import authController from './controllers/authController.js';

// Create drivers with different statuses
// DriverModel.create('John Doe', 'john@example.com', 'password123', 'driver', 'pending');
// DriverModel.create('Jane Smith', 'jane@example.com', 'password456', 'driver', 'approved');
// DriverModel.create('Mike Johnson', 'mike@example.com', 'password789', 'driver', 'inactive');

// update driver password
// DriverModel.updateDriverPassword('jalbin5@pride.hofstra.edu', 'test123');

// Update driver status
// DriverModel.updateStatus('john@example.com', 'approved');
// DriverModel.updateStatus('jane@example.com', 'inactive');

// Delete a driver
// DriverModel.delete('mike@example.com');

// Delete admin

// Create admins with different statuses
// AdminModel.create('Admin User 1', 'admin1@example.com', 'adminpass123', 'admin', 'approved');
// AdminModel.create('Admin User 2', 'admin2@example.com', 'adminpass456', 'admin', 'pending');

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

// Delete an address
// AddressModel.delete(2);

/*
AdminModel.createUser(
    'First Name', 
    'Last Name', 
    'email@example.com', 
    'password123', 
    'status', 
    'role', 
    'Country', 
    'City', 
    'State', 
    12345, 
    'Address', 
    'Description', 
    'some_color', 
    authController.getFormattedTime()
)
*/
