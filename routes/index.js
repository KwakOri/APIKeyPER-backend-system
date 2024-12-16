const express = require("express");
const client = require("../config/db");
const router = express.Router();

/* GET home page. */

router.get("/", async (req, res, next) => {
  try {
    const query = "SELECT * FROM users";
    const { rows } = await client.query(query);
    logger.info("유저 조회 성공");
    res.send(JSON.stringify({ data: rows }));
  } catch (err) {
    logger.error(err);
  }
});

module.exports = router;
