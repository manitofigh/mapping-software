require('dotenv').config();

const {Pool}= require("pg");

const isProduction = process.env.Node_ENV === "production";

const connectionString = `postgressql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});

module.exports = { pool};