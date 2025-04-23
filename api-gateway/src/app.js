const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('./config');
const setupSocketGateway = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// Configurar Socket.IO
setupSocketGateway(server);

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // En producción, limitar a los dominios necesarios
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas
app.use('/api', require('./routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Gateway funcionando correctamente');
});

// Iniciar servidor
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`API Gateway iniciado en el puerto ${PORT}`);
});
