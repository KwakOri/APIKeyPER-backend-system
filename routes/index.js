const express = require("express");
const pgQuery = require("../config/db");

const router = express.Router();

const authRouter = require("./auth");
const tokenRouter = require("./token");
const accountRouter = require("./account");
const testRouter = require("./test");

const verifyJWT = require("../middleware/verifyJWT");

router.use("/api/auth", authRouter);
router.use("/api/test", testRouter);
router.use("/api/token", verifyJWT, tokenRouter);
router.use("/api/account", verifyJWT, accountRouter);

/* GET home page. */

router.get("/", async (req, res, next) => {
  const query = { text: "SELECT * FROM apikeyper_users" };
  try {
    await pgQuery(query);
    console.log(":200 :GET / message: APIKeyPER에 어서오세요.");
    res.send(JSON.stringify({ message: "APIKeyPER에 어서오세요." }));
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
