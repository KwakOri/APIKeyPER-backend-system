const express = require("express");
const cookieParser = require("cookie-parser");
const nodeCron = require("node-cron");
const cors = require("cors");

const indexRouter = require("./routes/index");
const { sendScheduledNotification } = require("./controllers/firebase");

const app = express();

app.use(
  cors({
    origin: [
      "https://api-key-per-front.vercel.app",
      "https://api-key-per-front-git-dev-kwakoris-projects.vercel.app",
      "https://apikeyper.site",
      "https://www.apikeyper.site",
      "apikeyper.site",
      "http://localhost:3001",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE, OPTIONS"],
  })
);

// use middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", indexRouter);

nodeCron.schedule("40 * * * *", async () => {
  try {
    await sendScheduledNotification();
    console.log("Scheduled notification sent successfully");
  } catch (err) {
    console.error(err);
  }
});

module.exports = app;
