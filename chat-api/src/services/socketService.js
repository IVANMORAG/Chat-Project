const {
  createMessage,
  joinRoom,
  leaveRoom,
  getRoomUsers
} = require('../controllers/socketController');
const { verifySocketToken } = require('../middleware/authMiddleware');

const setupSocketIO = (io) => {
  // Middleware de autenticación
  io.use(verifySocketToken);

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.user.id}`);

    // Escuchar eventos
    socket.on('sendMessage', (data) => createMessage(socket, data));
    socket.on('joinRoom', (data) => joinRoom(socket, data));
    socket.on('leaveRoom', (data) => leaveRoom(socket, data));
    socket.on('getRoomUsers', (data) => getRoomUsers(socket, data));

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.user.id}`);
    });
  });
};

module.exports = setupSocketIO;
