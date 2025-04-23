const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Configurar Socket.IO para el gateway
const setupSocketGateway = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  });

  // Middleware para verificar token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No autorizado'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      return next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Cliente conectado al gateway: ${socket.id} - Usuario: ${socket.user.id}`);
    
    // Conectar al servidor de chat con mejores opciones de conexión
    const chatSocket = require('socket.io-client')(config.chatApiUrl, {
      auth: { token: socket.handshake.auth.token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Manejar eventos del cliente al servidor de chat
    socket.on('sendMessage', (data) => {
      console.log(`Reenviando mensaje al servidor de chat - Usuario: ${socket.user.id}`, data);
      chatSocket.emit('sendMessage', data);
    });
    
    socket.on('joinRoom', (data) => {
      console.log(`Uniendo a sala - Usuario: ${socket.user.id}, Sala: ${data.roomId}`);
      // Unirse a la sala tanto en gateway como en chat service
      socket.join(data.roomId);
      chatSocket.emit('joinRoom', data);
    });
    
    socket.on('leaveRoom', (data) => {
      console.log(`Saliendo de sala - Usuario: ${socket.user.id}, Sala: ${data.roomId}`);
      socket.leave(data.roomId);
      chatSocket.emit('leaveRoom', data);
    });
    
    socket.on('getRoomUsers', (data) => {
      chatSocket.emit('getRoomUsers', data);
    });
    
    // Manejar eventos del servidor de chat
    chatSocket.on('message', (data) => {
      console.log(`Mensaje recibido del chat - Sala: ${data.roomId}`, {
        sender: data.sender._id,
        content: data.content
      });
      // Solo emitir a la sala correspondiente (eliminamos la emisión duplicada)
      io.to(data.roomId).emit('message', data);
    });
    
    // Reenviar otros eventos directamente al cliente
    const eventsToForward = [
      'messageSent', 
      'previousMessages', 
      'userJoined', 
      'userLeft', 
      'roomUsers', 
      'error'
    ];
    
    eventsToForward.forEach(event => {
      chatSocket.on(event, (data) => {
        socket.emit(event, data);
      });
    });
    
    // Manejar errores de conexión con el chat
    chatSocket.on('connect_error', (err) => {
      console.error('Error de conexión con el servidor de chat:', err.message);
      socket.emit('error', { message: 'Error de conexión con el servidor de chat' });
    });
    
    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado del gateway: ${socket.id}`);
      chatSocket.disconnect();
    });
  });

  return io;
};

module.exports = setupSocketGateway;