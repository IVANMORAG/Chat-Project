const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config');
const setupSocketIO = require('./services/socketService');

// Conectar a la base de datos
connectDB();

const app = express();
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Configurar servicios de socket
setupSocketIO(io);

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Chat funcionando correctamente');
});

// Iniciar servidor
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO iniciado en el puerto ${PORT}`);
});
