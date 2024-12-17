require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_DB_HOST,
  port: process.env.PG_DB_PORT,
  user: process.env.PG_DB_USER,
  password: process.env.PG_DB_PASSWORD,
  database: process.env.PG_DB_DATABASE,
});

const pgQuery = async (query) => {
  const client = await pool.connect();
  try {
    return await client.query(query);
  } catch (err) {
    throw new Error(err);
  } finally {
    client.release(); // 사용 후 연결 반환
  }
};

console.log("POSTGRESQL is connected");

module.exports = pgQuery;
