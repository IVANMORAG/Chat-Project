// src/utils/config.js
// Asegúrate de que esta configuración coincida con la de tu API Gateway
const API_URL = 'http://192.168.1.181:3000'; // Cambia esto a la IP de tu API Gateway si es necesario

export const API_ENDPOINTS = {
  register: `${API_URL}/api/auth/register`,
  login: `${API_URL}/api/auth/login`,
  me: `${API_URL}/api/auth/me`,
  rooms: `${API_URL}/api/rooms`,
  myRooms: `${API_URL}/api/rooms/my`, // Cambiado de /my/rooms a /my
  joinRoom: (roomId) => `${API_URL}/api/rooms/${roomId}/join`,
  leaveRoom: (roomId) => `${API_URL}/api/rooms/${roomId}/leave`
};
export const SOCKET_URL = API_URL; // URL del Socket.io server