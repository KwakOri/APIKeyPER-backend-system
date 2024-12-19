const admin = require("../utils/firebase");

class NotificationService {
  static async sendNotification(deviceToken, title, body) {
    const message = {
      data: {
        title,
        body,
      },
      token: deviceToken,
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = NotificationService;
