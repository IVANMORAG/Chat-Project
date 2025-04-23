import axios from 'axios';
import { API_ENDPOINTS } from '../utils/config';

export const roomService = {
  getRooms: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.rooms);
      return response.data;
    } catch (error) {
      console.error('Error al obtener salas:', error);
      throw error;
    }
  },
  
  getMyRooms: async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.myRooms);
      console.log('Respuesta de mis salas:', response.data);
      
      // Normalizar la respuesta para que siempre tenga el formato esperado
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Si la respuesta es del tipo {success: true, count: X, data: [...]}
        return { rooms: response.data.data };
      } else if (response.data && Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        return { rooms: response.data };
      } else if (response.data && response.data.rooms && Array.isArray(response.data.rooms)) {
        // Si la respuesta ya tiene el formato esperado
        return response.data;
      } else {
        // Formato desconocido, devolver array vacío
        console.warn("Formato de respuesta desconocido:", response.data);
        return { rooms: [] };
      }
    } catch (error) {
      console.error('Error detallado al obtener mis salas:', error);
      throw error;
    }
  },
  
  createRoom: async (roomData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.rooms, roomData);
      const data = response.data;
      
      // Normalizar la respuesta
      if (data && data.success && data.data) {
        return { room: data.data };
      } else if (data && data.room) {
        return data;
      } else {
        return { room: data };
      }
    } catch (error) {
      console.error('Error al crear sala:', error);
      throw error;
    }
  },
  
  joinRoom: async (roomId) => {
    try {
      const response = await axios.post(API_ENDPOINTS.joinRoom(roomId));
      const data = response.data;
      
      // Normalizar la respuesta
      if (data && data.success && data.data) {
        return { room: data.data };
      } else if (data && data.room) {
        return data;
      } else {
        return { room: data };
      }
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      throw error;
    }
  },
  
  leaveRoom: async (roomId) => {
    try {
      const response = await axios.post(API_ENDPOINTS.leaveRoom(roomId));
      return response.data;
    } catch (error) {
      console.error('Error al salir de la sala:', error);
      throw error;
    }
  }
};