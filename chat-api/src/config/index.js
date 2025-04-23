require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3003,
  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  authApiUrl: process.env.API_AUTH_URL,
  roomsApiUrl: process.env.API_ROOMS_URL
};
