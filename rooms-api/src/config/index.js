require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  authApiUrl: process.env.API_AUTH_URL,
  chatApiUrl: process.env.API_CHAT_URL
};
