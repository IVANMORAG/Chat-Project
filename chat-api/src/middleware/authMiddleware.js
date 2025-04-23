const jwt = require('jsonwebtoken');
const config = require('../config');

exports.verifySocketToken = (socket, next) => {
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
};
