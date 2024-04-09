-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(200) NOT NULL
);

CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) UNIQUE NOT NULL,
    realAddress VARCHAR(255),
    lat_long VARCHAR(255) NOT NULL
    isvalid BOOLEAN
);

CREATE TABLE job (
    id SERIAL PRIMARY KEY,
    driverName VARCHAR(255),
    routeNumber INTEGER,
    waypointIndex INTEGER,
    lat_long VARCHAR(255),
    realAddress VARCHAR(255),
    startDate TIMESTAMP,
    formattedDuration VARCHAR(100),
    durationSeconds INTEGER,
    isCompleted BOOLEAN DEFAULT false,
    isStartOfRoute BOOLEAN DEFAULT false,
    routeStarted BOOLEAN DEFAULT false,
    issubmitted BOOLEAN DEFAULT false,
);
