const express = require("express");
const router = express.Router();

const {
  saveTokenData,
  getAllTokenData,
  getTokenData,
  updateTokenData,
  deleteTokenData,
} = require("../controllers/token");

router.route("/").get(getAllTokenData).post(saveTokenData);
router
  .route("/:id")
  .get(getTokenData)
  .put(updateTokenData)
  .delete(deleteTokenData);

module.exports = router;
