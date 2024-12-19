const dayjs = require("dayjs");
const pgQuery = require("../config/db");
const NotificationService = require("../service/NotificationService");

const sendFirebaseNotification = async (req, res) => {
  try {
    const getUsersQuery = {
      text: "SELECT * FROM users",
    };

    const getTokensQuery = {
      text: "SELECT * FROM tokens",
    };

    const users = await pgQuery(getUsersQuery);
    const tokens = await pgQuery(getTokensQuery);
    const usersHavingDeviceToken = users.filter((user) => user.device_token);
    console.log("users => ", users);
    console.log("usersHavingDeviceToken => ", usersHavingDeviceToken);

    // const funcs =

    const { title, body, deviceToken } = req.body;

    const result = await NotificationService.sendNotification(
      deviceToken,
      title,
      body
    );

    console.log(":201: POST /api/firebase/send-notification message 전송 성공");
    res
      .status(200)
      .json({ message: "Notification sent successfully", success: true });
  } catch (err) {
    res;

    logger
      .error(":500: POST /api/firebase/send-notification message 전송 실패")
      .status(500)
      .json({ message: "Error sending notification", success: false });
  }
};

const sendScheduledNotification = async () => {
  try {
    const getUsersQuery = {
      text: "SELECT * FROM users",
    };

    const getTokensQuery = {
      text: "SELECT * FROM tokens",
    };

    const { rows: users } = await pgQuery(getUsersQuery);
    const { rows: tokens } = await pgQuery(getTokensQuery);
    const usersHavingDeviceToken = users.filter((user) => user.device_token);

    usersHavingDeviceToken.forEach((user) => {
      const usersTokens = tokens.filter(
        (token) => String(user.id) === String(token.user_id)
      );

      if (usersTokens.length === 0) return;

      const { DAYS_7, DAYS_30 } = usersTokens.reduce(
        (acc, token) => {
          const expiryDate = dayjs(token.token_expiry_date);
          const now = dayjs();
          const remainingDays = Math.ceil(
            expiryDate.diff(now) / (1000 * 60 * 60 * 24)
          );
          console.log(remainingDays);
          if (remainingDays > 0 && remainingDays <= 7)
            return { ...acc, DAYS_7: acc.DAYS_7 + 1 };
          if (remainingDays > 7 && remainingDays <= 30)
            return { ...acc, DAYS_30: acc.DAYS_30 + 1 };
          return acc;
        },
        {
          DAYS_7: 0,
          DAYS_30: 0,
        }
      );

      if (!DAYS_7 && !DAYS_30) return;

      const getNotificationBody = ({ DAYS_7, DAYS_30 }) => {
        const body = [];
        if (DAYS_7) body.push(`일주일 미만: ${DAYS_7}건`);
        if (DAYS_30) body.push(`한 달 미만: ${DAYS_30}건`);
        return `<키 만료 알림> ${user.username}님! ${body.join(
          ", "
        )}이 곧 만료됩니다.`;
      };
      const deviceToken = user.device_token;
      const title = "APIKeyPER";
      const body = getNotificationBody({ DAYS_7, DAYS_30 });

      NotificationService.sendNotification(deviceToken, title, body);
    });
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { sendFirebaseNotification, sendScheduledNotification };
