const express = require("express");
const client = require("../config/db");
const router = express.Router();

/* GET home page. */

router.get("/", async (req, res, next) => {
  const query = "SELECT * FROM users";
  const { rows } = await client.query(query);

  client.end();
  res.send(JSON.stringify({ data: rows }));
});

module.exports = router;
