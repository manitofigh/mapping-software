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

-- GEOCODED LOCATIONS TABLE
CREATE TABLE geocoded_locations (
    id SERIAL PRIMARY KEY,
    address TEXT,
    lat_lon VARCHAR(64),
    real_address TEXT,
    quality VARCHAR(32)
);

-- DELIVERY LOCATIONS TABLE
CREATE TABLE delivery_locations (
  id SERIAL PRIMARY KEY,
  address TEXT,
  lat_lon VARCHAR(64),
  driver_email TEXT,
  color VARCHAR(16),
  status VARCHAR(64),
  created_at VARCHAR(128)
);

-- DELIVERY JOBS TABLE
CREATE TABLE delivery_jobs (
    id SERIAL PRIMARY KEY,
    driver_email VARCHAR(255),
    trip_number INTEGER,
    waypoint_index INTEGER,
    start_address TEXT,
    end_address TEXT,
    start_lat_lon VARCHAR(64),
    end_lat_lon VARCHAR(64),
    start_time VARCHAR(128),
    end_time VARCHAR(128),
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    distance NUMERIC,
    status VARCHAR(64) DEFAULT 'pending',
    color VARCHAR(50)
);

-- FULL GEOMETRY FOR EACH TRIP
CREATE TABLE trip_geometries (
    id SERIAL PRIMARY KEY,
    driver_email VARCHAR(255),
    trip_number INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    color VARCHAR(50),
    geometry TEXT
);

