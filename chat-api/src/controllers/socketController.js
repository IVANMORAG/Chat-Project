const Message = require('../models/messageModel');
const axios = require('axios');
const config = require('../config');

const getUsername = async (userId, token) => {
  try {
    const response = await axios.get(`${config.authApiUrl}/api/auth/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.data.username || `Usuario-${userId.substring(0, 4)}`;
  } catch (error) {
    console.error('Error al obtener username:', {
      userId,
      error: error.response?.data || error.message
    });
    return `Usuario-${userId.substring(0, 4)}`; // Fallback con parte del ID
  }
};

// Validar si un usuario pertenece a una sala (versión mejorada)
const userBelongsToRoom = async (socket, roomId) => {
  try {
    const userId = socket.user.id;
    const token = socket.handshake.auth.token; // Usar token del usuario

    const response = await axios.get(`${config.roomsApiUrl}/api/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}` // Usar token del usuario, no de servicio
      }
    });

    const room = response.data.data || response.data;
    return room.members.includes(userId);
  } catch (error) {
    console.error('Error al verificar membresía de sala:', {
      error: error.response?.data || error.message,
      roomId,
      userId: socket.user?.id
    });
    return false;
  }
};

// Controlador para crear mensajes (versión mejorada)
exports.createMessage = async (socket, data) => {
  try {
    const { content, roomId, tempId, username } = data; // Añadimos username
    const userId = socket.user.id;
    const token = socket.handshake.auth.token;

    if (!content || !roomId) {
      throw new Error('Datos incompletos');
    }

    // Validar membresía con el nuevo método
    const isMember = await userBelongsToRoom(socket, roomId);
    if (!isMember) {
      throw new Error('No eres miembro de esta sala');
    }

    // Crear mensaje en DB
    const message = await Message.create({
      content,
      room: roomId,
      sender: userId
    });

    // Construir respuesta
    const messageToEmit = {
      _id: message._id,
      content: message.content,
      roomId,
      sender: {
        _id: userId,
        username: username || `Usuario-${userId.substring(0, 4)}` // Usar el username enviado desde el frontend
      },
      createdAt: message.createdAt,
      tempId
    };

    // Emitir a TODA la sala (incluyendo al emisor)
    socket.to(roomId).emit('message', messageToEmit);
    socket.emit('message', messageToEmit);

    return { success: true, message: messageToEmit };

  } catch (error) {
    console.error('Error en createMessage:', {
      error: error.message,
      roomId: data.roomId,
      userId: socket.user?.id
    });
    
    // Emitir error específico con tempId
    socket.emit('messageError', { 
      message: error.message,
      tempId: data.tempId,
      roomId: data.roomId
    });
    
    return { success: false, error: error.message };
  }
};

exports.joinRoom = async (socket, data) => {
  try {
    const { roomId } = data;
    const userId = socket.user.id;
    const token = socket.handshake.auth.token;

    if (!roomId) {
      throw new Error('ID de sala no proporcionado');
    }

    // Verificar pertenencia a la sala con el nuevo método
    const isMember = await userBelongsToRoom(socket, roomId);
    if (!isMember) {
      throw new Error('No eres miembro de esta sala');
    }

    // Unirse a la sala
    socket.join(roomId);
    
    // Notificar a los demás miembros
    socket.to(roomId).emit('userJoined', { 
      userId, 
      username: await getUsername(userId, token),
      roomId 
    });

    // Cargar mensajes anteriores
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(50);
      
    // Agregar username a cada mensaje
    const messagesWithUsernames = await Promise.all(
      messages.reverse().map(async (msg) => {
        const senderUsername = await getUsername(msg.sender.toString(), token);
        return {
          _id: msg._id,
          content: msg.content,
          roomId,
          sender: {
            _id: msg.sender,
            username: senderUsername
          },
          createdAt: msg.createdAt
        };
      })
    );

    // Enviar mensajes al usuario
    socket.emit('previousMessages', {
      roomId,
      messages: messagesWithUsernames
    });

  } catch (error) {
    console.error('Error en joinRoom:', error);
    socket.emit('roomError', {
      roomId: data?.roomId,
      message: error.message,
      code: 'JOIN_ERROR'
    });
  }
};

// Salir de una sala (versión mejorada)
exports.leaveRoom = async (socket, data) => {
  try {
    const { roomId } = data;
    const userId = socket.user.id;

    if (!roomId) {
      throw new Error('ID de sala no proporcionado');
    }

    // Salir de la sala
    socket.leave(roomId);
    
    // Notificar a los demás miembros
    socket.to(roomId).emit('userLeft', { userId, roomId });

    // Confirmar al usuario
    socket.emit('roomStatus', {
      roomId,
      status: 'left'
    });

  } catch (error) {
    console.error('Error en leaveRoom:', {
      error: error.message,
      roomId: data?.roomId,
      userId: socket.user?.id
    });
    
    socket.emit('roomError', {
      roomId: data?.roomId,
      message: error.message,
      code: 'LEAVE_ERROR'
    });
  }
};

const getRoomMembers = async (roomId) => {
  try {
    const response = await axios.get(`${config.roomsApiUrl}/api/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SERVICE_TOKEN}`
      }
    });
    
    // Asegúrate de manejar ambas posibles estructuras de respuesta
    return response.data.data?.members || response.data.members || [];
  } catch (error) {
    console.error('Error al obtener miembros de sala:', {
      error: error.response?.data || error.message,
      roomId
    });
    return [];
  }
};