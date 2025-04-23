const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',  // En producción, limitar a los dominios necesarios
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas
app.use('/api/rooms', require('./routes/roomRoutes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Rooms funcionando correctamente');
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
