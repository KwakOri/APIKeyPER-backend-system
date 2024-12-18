const pgQuery = require("../config/db");

const deleteAccount = async (req, res) => {
  const { user_id } = req;

  try {
    const deleteAccountQuery = {
      text: `DELETE FROM users WHERE id = $1`,
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

module.exports = { deleteAccount };
