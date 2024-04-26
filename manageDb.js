import DriverModel from './models/DriverModel.js';
import AdminModel from './models/AdminModel.js';
import authController from './controllers/authController.js';

// Create drivers with different statuses
// DriverModel.create('John Doe', 'john@example.com', 'password123', 'driver', 'pending');
// DriverModel.create('Jane Smith', 'jane@example.com', 'password456', 'driver', 'approved');
// DriverModel.create('Mike Johnson', 'mike@example.com', 'password789', 'driver', 'inactive');

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

// Create routes for different drivers
// RouteModel.create(1, '[[40.7128, -74.0060], [37.7749, -122.4194]]', '[3600, 7200]');
// RouteModel.create(2, '[[51.5074, -0.1278], [41.8781, -87.6298]]', '[5400, 9000]');

// Update route status
// RouteModel.updateStatus(1, 'completed');

// Delete a route
// RouteModel.delete(2);

// Create travel times for different routes
// TravelTimeModel.create(1, '123 Main St, City', '456 Elm St, Town', 3600, 3800);
// TravelTimeModel.create(1, '456 Elm St, Town', '123 Main St, City', 7200, 7500);
// TravelTimeModel.create(2, '789 Oak St, Village', '321 Maple Ave, Borough', 5400, 5200);
// TravelTimeModel.create(2, '321 Maple Ave, Borough', '789 Oak St, Village', 9000, 9200);

// Update actual travel time
// TravelTimeModel.updateActualTime(1, 3700);
// TravelTimeModel.updateActualTime(3, 5300);

// Delete a travel time entry
// TravelTimeModel.delete(2);

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
