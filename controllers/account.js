const pgQuery = require("../config/db");

const deleteAccount = async (req, res) => {
  const { user_id } = req;

  try {
    const deleteAccountQuery = {
      text: `DELETE FROM apikeyper_users WHERE id = $1`,
      values: [user_id],
    };
    await pgQuery(deleteAccountQuery);

    console.log(":200 :DELETE /account 회원 탈퇴 성공");
    return res
      .status(200)
      .send(
        JSON.stringify({ success: true, message: "회원탈퇴가 완료되었습니다" })
      );
  } catch (err) {
    console.error(":500 :DELETE /account 회원 탈퇴 실패");
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 오류가 발생했습니다",
      })
    );
  }
};

const addDeviceToken = async (req, res) => {
  const { user_id } = req;
  const { deviceToken } = req.body;

  try {
    const saveDeviceTokenQuery = {
      text: `UPDATE apikeyper_users SET device_token = $1 WHERE id = $2`,
      values: [deviceToken, user_id],
    };
    await pgQuery(saveDeviceTokenQuery);

    console.error(":200 :POST /account/device-token 디바이스 토큰 등록 성공");

    return res.status(200).send(
      JSON.stringify({
        success: true,
        message: "디바이스 토큰 등록이 완료되었습니다",
      })
    );
  } catch (err) {
    console.error(":500 :POST /account/device-token 디바이스 토큰 등록 실패");
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 오류가 발생했습니다",
      })
    );
  }
};

module.exports = { deleteAccount, addDeviceToken };
