const axios = require('axios');
const config = require('../config');

const authService = {
  async register(userData) {
    try {
      const response = await axios.post(
        `${config.authApiUrl}/api/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message);
      }
    }
  },

  async login(credentials) {
    try {
      const response = await axios.post(
        `${config.authApiUrl}/api/auth/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message);
      }
    }
  },

  async getMe(token) {
    try {
      const response = await axios.get(`${config.authApiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message);
      }
    }
  }
};

module.exports = authService;
