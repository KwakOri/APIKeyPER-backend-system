const express = require("express");
const cookieParser = require("cookie-parser");
const nodeCron = require("node-cron");

const indexRouter = require("./routes/index");
const { sendScheduledNotification } = require("./controllers/firebase");

const app = express();

// use middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", indexRouter);

nodeCron.schedule("* * * * *", async () => {
  try {
    await sendScheduledNotification();
    console.log("Scheduled notification sent successfully");
  } catch (err) {
    console.error(err);
  }
});

module.exports = app;
