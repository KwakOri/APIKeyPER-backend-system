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
      "https://api-key-per-front.vercel.app/",
      "https://api-key-per-front-git-dev-kwakoris-projects.vercel.app/",
      "https://api-key-per-front-ng1ez5zt1-kwakoris-projects.vercel.app/",
    ],
    credentials: true,
  })
);
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "Access-Control-Allow-Origin",
//     ],
//     exposedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "Access-Control-Allow-Origin",
//     ],
//   })
// );

// use middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", indexRouter);

// nodeCron.schedule("* * * * *", async () => {
//   try {
//     await sendScheduledNotification();
//     console.log("Scheduled notification sent successfully");
//   } catch (err) {
//     console.error(err);
//   }
// });

module.exports = app;
