const express = require("express");
const { sendScheduledNotification } = require("../controllers/firebase");
const router = express.Router();

router.route("/device-token").post(async (req, res) => {
  try {
    await sendScheduledNotification();
    console.log("send a message successfully");
    res.send(JSON.stringify({ success: true }));
  } catch (err) {
    console.error(err);
    res.send(JSON.stringify({ success: false }));
  }
});

module.exports = router;
