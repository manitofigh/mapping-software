CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    email TEXT,
    password VARCHAR(256),
    nonce VARCHAR(128),
    status VARCHAR(64),
    role VARCHAR(64),
    country VARCHAR(128),
    city VARCHAR(128),
    state VARCHAR(128),
    zip VARCHAR(16),
    street TEXT,
    full_address TEXT,
    about TEXT,
	  color VARCHAR(16),
    create_time VARCHAR(64),
    delete_time VARCHAR(64)
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