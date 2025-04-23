require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  authApiUrl: process.env.AUTH_API_URL,
  roomsApiUrl: process.env.ROOMS_API_URL,
  chatApiUrl: process.env.CHAT_API_URL,
  jwtSecret: process.env.JWT_SECRET
};
