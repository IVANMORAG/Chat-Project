import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/config';

let socket = null;

export const initSocket = (token) => {
  if (!socket && token) {
    console.log('Inicializando socket con URL:', SOCKET_URL);
    
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'], // Forzar WebSocket
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    // Mejor manejo de eventos
    const handleConnect = () => console.log('✅ Conectado al servidor de socket');
    const handleDisconnect = (reason) => {
      console.log('❌ Desconectado:', reason);
      if (reason === 'io server disconnect') {
        socket.connect(); // Reconectar automáticamente
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    socket.on('connect_error', (err) => {
      console.error('Error de conexión:', err.message);
      setTimeout(() => socket.connect(), 1000);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;