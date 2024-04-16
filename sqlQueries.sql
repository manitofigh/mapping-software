CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL
);

-- Create Drivers table
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL
);

-- Create Addresses table
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  driver_id INTEGER REFERENCES Drivers(id),
  status VARCHAR(20) DEFAULT 'active'
);

-- Create Routes table
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES Drivers(id),
  coordinates JSON NOT NULL,
  estimated_times JSON NOT NULL
);

-- Create TravelTimes table
CREATE TABLE travelTimes (
  id SERIAL PRIMARY KEY,
  route_id INTEGER REFERENCES Routes(id),
  start_point VARCHAR(255) NOT NULL,
  end_point VARCHAR(255) NOT NULL,
  estimated_time INTEGER NOT NULL,
  actual_time INTEGER
);
