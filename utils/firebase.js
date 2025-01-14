require("dotenv").config();

const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.FCM_ADMIN_TYPE,
  project_id: process.env.FCM_ADMIN_PROJECT_ID,
  private_key_id: process.env.FCM_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FCM_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FCM_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FCM_ADMIN_CLIENT_ID,
  auth_uri: process.env.FCM_ADMIN_AUTH_URI,
  token_uri: process.env.FCM_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.FCM_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FCM_ADMIN_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FCM_ADMIN_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase initialized!");

module.exports = admin;
