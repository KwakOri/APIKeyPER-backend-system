const pgQuery = require("../config/db");
const Token = require("../models/Token");

const getAllTokenData = async (req, res) => {
  const { user_id } = req;
  try {
    const getAllTokenDataQuery = {
      text: `SELECT * FROM apikeyper_tokens WHERE user_id = $1`,
      values: [user_id],
    };

    const { rows } = await pgQuery(getAllTokenDataQuery);

    if (rows.length === 0) {
      console.log(":200 :GET /api/token 조회 성공, 데이터 없음");
      return res.status(200).send(JSON.stringify({ data: [] }));
    } else {
      console.log(":200 :GET /api/token 토큰 조회 성공");
      return res
        .status(200)
        .send(JSON.stringify({ data: Token.makeRowsToTokens(rows) }));
    }
  } catch (err) {
    console.error(":500 :GET /api/token 토큰 조회 실패");
    console.error(err);
    res.send(err);
  }
};

const saveTokenData = async (req, res) => {
  const {
    tokenName,
    tokenDescription,
    tokenValue,
    tokenCreatedDate,
    tokenExpiryDate,
    notificationOption,
  } = req.body;
  const { user_id } = req;
  try {
    const saveTokenDataQuery = {
      text: `INSERT INTO apikeyper_tokens(token_name, token_description, token_value, token_created_date, token_expiry_date, notification_option, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [
        tokenName,
        tokenDescription,
        tokenValue,
        tokenCreatedDate,
        tokenExpiryDate,
        notificationOption,
        user_id,
      ],
    };

    await pgQuery(saveTokenDataQuery);
    console.log(":201 :POST /token 토큰 데이터 저장 성공");
    return res.send({ success: true });
  } catch (err) {
    console.error(":500 :POST /token 토큰 데이터 저장 실패");
    console.error(err);
    return res.send(err);
  }
};

const getTokenData = async (req, res) => {
  const tokenDataId = req.params.id;

  try {
    const getTokenDataQuery = {
      text: `SELECT * FROM apikeyper_tokens WHERE id = $1`,
      values: [tokenDataId],
    };

    const { rows } = await pgQuery(getTokenDataQuery);

    if (rows.length === 0) {
      console.log(":200 :GET /token/:id 토큰 조회 성공, 데이터 없음");
      return res.send(JSON.stringify({ data: null }));
    } else {
      console.log(":200 :GET /token/:id 토큰 조회 성공");
      return res.send(
        JSON.stringify({
          data: Token.makeRowsToToken(rows),
        })
      );
    }
  } catch (err) {
    console.error(":500 :GET /token/:id 토큰 조회 실패");
    console.error(err);
    res.send(err);
  }
};

const updateTokenData = async (req, res) => {
  const tokenDataId = req.params.id;

  const {
    tokenName,
    tokenDescription,
    tokenValue,
    tokenCreatedDate,
    tokenExpiryDate,
    notificationOption,
  } = req.body;
  try {
    const updateTokenDataQuery = {
      text: `UPDATE apikeyper_tokens SET token_name = $1, token_description = $2, token_value = $3, token_created_date = $4, token_expiry_date = $5, notification_option = $6 WHERE id = $7`,
      values: [
        tokenName,
        tokenDescription,
        tokenValue,
        tokenCreatedDate,
        tokenExpiryDate,
        notificationOption,
        tokenDataId,
      ],
    };
    await pgQuery(updateTokenDataQuery);
    console.log(":201 :PUT /token/:id 토큰 데이터 수정 성공");
    return res.send({ success: true });
  } catch (err) {
    console.error(":201 :PUT /token/:id 토큰 데이터 수정 실패");
    console.error(err);
    return res.send(err);
  }
};

const deleteTokenData = async (req, res) => {
  const tokenDataId = req.params.id;
  const { user_id } = req;

  try {
    const deleteTokenDataQuery = {
      text: `DELETE FROM apikeyper_tokens WHERE id = $1 AND user_id = $2`,
      values: [tokenDataId, user_id],
    };

    await pgQuery(deleteTokenDataQuery);

    console.log(":204 :DELETE /token/:id 토큰 데이터 삭제 성공");
    return res.send({ success: true });
  } catch (err) {
    console.error(":204 :DELETE /token/:id 토큰 데이터 삭제 실패");
    console.error(err);
    return res.send(err);
  }
};

module.exports = {
  getAllTokenData,
  saveTokenData,
  getTokenData,
  updateTokenData,
  deleteTokenData,
};
