// src/utils/config.js
// Esta configuración apunta al Nginx que balanceará el API Gateway
const API_URL = 'http://192.168.1.181:8000'; // Cambiado de 3000 a 8000 (puerto Nginx)

export const API_ENDPOINTS = {
  register: `${API_URL}/api/auth/register`,
  login: `${API_URL}/api/auth/login`,
  me: `${API_URL}/api/auth/me`,
  rooms: `${API_URL}/api/rooms`,
  myRooms: `${API_URL}/api/rooms/my`,
  joinRoom: (roomId) => `${API_URL}/api/rooms/${roomId}/join`,
  leaveRoom: (roomId) => `${API_URL}/api/rooms/${roomId}/leave`
};
export const SOCKET_URL = API_URL; // URL del Socket.io server