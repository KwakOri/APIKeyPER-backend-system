require("dotenv").config();

const { Client } = require("pg");

const client = new Client({
  host: process.env.PG_DB_HOST,
  port: process.env.PG_DB_PORT,
  user: process.env.PG_DB_USER,
  password: process.env.PG_DB_PASSWORD,
  database: process.env.PG_DB_DATABASE,
});

client.connect((err) => {
  if (err) return console.log("not connected");
  else return console.log("DB connected successfully");
});

module.exports = client;
