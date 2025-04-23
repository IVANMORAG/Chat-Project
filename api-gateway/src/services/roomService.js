const axios = require('axios');
const config = require('../config');

const roomService = {
  async getRooms(token) {
    try {
      const response = await axios.get(`${config.roomsApiUrl}/api/rooms`, {
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
  },

  async createRoom(roomData, token) {
    try {
      const response = await axios.post(
        `${config.roomsApiUrl}/api/rooms`,
        roomData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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

  async getRoom(roomId, token) {
    try {
      const response = await axios.get(
        `${config.roomsApiUrl}/api/rooms/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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

  async joinRoom(roomId, token) {
    try {
      const response = await axios.post(
        `${config.roomsApiUrl}/api/rooms/${roomId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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

  async leaveRoom(roomId, token) {
    try {
      const response = await axios.post(
        `${config.roomsApiUrl}/api/rooms/${roomId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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

  async getMyRooms(token) {
    try {
      const response = await axios.get(
        `${config.roomsApiUrl}/api/rooms/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
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

module.exports = roomService;
