require("dotenv").config();

const express = require("express");

const router = express.Router();

/* GET users listing. */
router.get("/", async (req, res, next) => {
  res.send(JSON.stringify({ success: true, message: "User Router" }));
});

module.exports = router;
