const express = require("express");
const pgQuery = require("../config/db");
const logger = require("../config/logger");

const router = express.Router();

/* GET home page. */

router.get("/", async (req, res, next) => {
  const query = { text: "SELECT * FROM users" };
  try {
    const { rows } = await pgQuery(query);
    logger.info("유저 조회 성공");
    res.send(JSON.stringify({ data: rows }));
  } catch (err) {
    logger.error(err);
  }
});

module.exports = router;
