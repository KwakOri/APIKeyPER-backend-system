// Module import

require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pgQuery = require("../config/db");
const transporter = nodemailer.createTransport({
  service: "gmail", // gmail을 사용함
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});
const {
  REFRESH_TOKEN_EXPIRY_TIME,
  ACCESS_TOKEN_EXPIRY_TIME,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME,
} = require("../constants/token");

// Controller functions

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findEmailQuery = {
      text: `SELECT * FROM apikeyper_users WHERE email = $1`,
      values: [email],
    };
    const { rows } = await pgQuery(findEmailQuery);

    if (rows.length === 0) {
      console.log(
        ":404 :POST /api/auth/log-in error: 존재하지 않는 이메일입니다."
      );
      return res.status(404).send(
        JSON.stringify({
          success: false,
          message: "등록되지 않은 이메일입니다.",
        })
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, rows[0].password);

    if (!isPasswordCorrect) {
      console.log(
        ":404 :POST /api/auth/log-in error: 비밀번호가 일치하지 않습니다."
      );
      return res.status(404).send(
        JSON.stringify({
          success: false,
          message: "비밀번호가 일치하지 않습니다.",
        })
      );
    }

    const { id: userId } = rows[0];

    const accessToken = jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
      }
    );

    const refreshToken = jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
      }
    );

    const updateRefreshTokenQuery = {
      text: `UPDATE apikeyper_users SET refresh_token = $1 WHERE id = $2`,
      values: [refreshToken, userId],
    };

    await pgQuery(updateRefreshTokenQuery);

    console.log(":200 :POST /api/auth/log-in 로그인 성공");

    res.setHeader("authorization", `Bearer ${accessToken}`);

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .send(JSON.stringify({ accessToken }));
  } catch (err) {
    console.error(":500 :POST /api/auth/log-in 로그인 실패");
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // bcrypt로 비밀번호 암호화 하기
    const salt = bcrypt.genSaltSync(10);

    const hashedPassword = bcrypt.hashSync(password, salt);

    const createNewUserDataQuery = {
      text: `INSERT INTO apikeyper_users(username, email, password) VALUES ($1, $2, $3)`,
      values: [username, email, hashedPassword],
    };

    await pgQuery(createNewUserDataQuery);

    console.log(":200 :POST /api/auth/sign-up 회원가입 성공");

    const verificationToken = jwt.sign(
      {
        email,
      },
      process.env.JWT_EMAIL_VERIFICATION_TOKEN_SECRET_KEY,
      {
        expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME,
      }
    );

    const mailOptions = {
      from: process.env.GMAIL_EMAIL, // 작성자
      to: email, // 수신자
      subject: "APIKeyPER Sign Up Verification Code", // 메일 제목
      html: `<p>Please click the following link to verify your email address:</p>
      <p> <a href="${process.env.SERVER_DOMAIN}/api/auth/sign-up/verification/email/${verificationToken}">Verify email</a> </p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        transporter.close();
        console.log(":500 :POST /api/auth/sign-up 인증메일 발송 실패");
        console.error(error);
        res.status(500).send(
          JSON.stringify({
            success: false,
            message: "인증메일 발송에 실패했습니다",
          })
        );
      } else {
        transporter.close();
        console.log(":200 :POST /api/auth/sign-up 인증메일 발송 성공");
        console.log("Verification Email sent: " + info.response);
        res.status(201).send(
          JSON.stringify({
            success: true,
            message:
              "회원가입에 성공했습니다. 메일함에서 인증메일을 확인해주세요.",
          })
        );
      }
    });
  } catch (err) {
    console.error(":500 :POST /api/auth/sign-up 회원가입 에러 발생");
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

const logOut = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) return res.sendStatus(204);

    const refreshToken = cookies.refreshToken;
    const isRefreshTokenInDB = {
      text: `SELECT * FROM apikeyper_users WHERE refresh_token = $1`,
      values: [refreshToken],
    };

    const { rows } = await pgQuery(isRefreshTokenInDB);

    if (rows.length === 0) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
      });
      return res.sendStatus(204);
    }

    const deleteRefreshTokenQuery = {
      text: `UPDATE apikeyper_users SET refresh_token = null WHERE id = $1`,
      values: [rows[0].id],
    };

    await pgQuery(deleteRefreshTokenQuery);

    console.log(":200 :DELETE /api/auth/log-out 로그아웃 성공");

    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    return res.sendStatus(204);
  } catch (err) {
    console.error(":500 :DELETE /api/auth/log-out 로그아웃 실패");
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

const validateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const isExistingUserQuery = {
      text: `SELECT * FROM apikeyper_users WHERE email = $1`,
      values: [email],
    };
    const { rows: existingUser } = await pgQuery(isExistingUserQuery);
    const isExist = existingUser.length > 0;
    if (isExist) {
      console.log(
        ":409 :POST /api/auth/validation/email message: 이미 등록된 이메일입니다"
      );
      return res.status(409).send(
        JSON.stringify({
          success: false,
          message: "이미 등록된 이메일입니다.",
        })
      );
    }

    console.log(
      ":200 :POST /api/auth/validation/email message: 사용 가능한 이메일입니다."
    );
    return res.status(200).send(
      JSON.stringify({
        success: true,
        message: "사용 가능한 이메일입니다.",
      })
    );
  } catch (err) {
    console.error(
      ":500 :POST /api/auth/validation/email 이메일 중복 검사 실패"
    );
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

const verifyEmailVerificationToken = async (req, res) => {
  try {
    if (!req.params?.token)
      return res.status(400).send(
        JSON.stringify({
          success: false,
          message: "인증토큰이 존재하지 않습니다.",
        })
      );
    const verificationToken = req.params.token;

    jwt.verify(
      verificationToken,
      process.env.JWT_EMAIL_VERIFICATION_TOKEN_SECRET_KEY,
      async (err, decoded) => {
        if (err || !decoded?.email) return res.sendStatus(401);

        const userEmail = decoded.email;

        try {
          const emailVerificationQuery = {
            text: `UPDATE apikeyper_users SET is_verified = 'true' WHERE email = $1 `,
            values: [userEmail],
          };

          await pgQuery(emailVerificationQuery);

          console.log(
            `:200 :GET /api/auth/verification/email message: ${userEmail}, 이메일 인증 성공`
          );
          return res.redirect(`${process.env.DOMAIN}/auth/sign-up/success`);
        } catch (err) {
          logger.error(err);
          return res.redirect(`${process.env.DOMAIN}/auth/sign-up/fail`);
        }
      }
    );
  } catch (err) {
    console.log(
      `:500 :GET /api/auth/verification/email message: ${userEmail}, 이메일 인증 실패`
    );
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) return res.status(401);

    const refreshToken = cookies.refreshToken;

    const findRefreshTokenQuery = {
      text: `SELECT * FROM apikeyper_users WHERE refresh_token = $1`,
      values: [refreshToken],
    };

    const { rows } = await pgQuery(findRefreshTokenQuery);

    if (rows.length === 0) return res.sendStatus(401);

    const foundUser = rows[0];

    //evaluate jwt

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      (err, decoded) => {
        if (err || foundUser.id !== decoded.user_id) return res.sendStatus(401);

        const accessToken = jwt.sign(
          { user_id: foundUser.id },
          process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
          { expiresIn: ACCESS_TOKEN_EXPIRY_TIME }
        );

        res.setHeader("Authorization", `Bearer ${accessToken}`);

        return res.send(JSON.stringify({ accessToken }));
      }
    );
  } catch (err) {
    console.log(`:500 :GET /api/auth/refresh message: access token 갱신 실패`);
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

module.exports = {
  logIn,
  signUp,
  logOut,
  validateEmail,
  verifyEmailVerificationToken,
  handleRefreshToken,
};
