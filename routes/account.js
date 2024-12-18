const express = require("express");
const router = express.Router();
const { deleteAccount, addDeviceToken } = require("../controllers/account");

router.route("/").delete(deleteAccount);
router.route("/device-token").post(addDeviceToken);

module.exports = router;
