const express = require('express');
const roomService = require('../services/roomService');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Obtener todas las salas
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await roomService.getRooms(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/rooms
// @desc    Crear una nueva sala
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await roomService.createRoom(req.body, token);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Obtener una sala por ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await roomService.getRoom(req.params.id, token);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/rooms/:id/join
// @desc    Unirse a una sala
// @access  Private
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await roomService.joinRoom(req.params.id, token);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/rooms/:id/leave
// @desc    Salir de una sala
// @access  Private
router.post('/:id/leave', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await roomService.leaveRoom(req.params.id, token);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/rooms/my
// @desc    Obtener mis salas
// @access  Private
// Por esto:
router.get('/my', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const result = await roomService.getMyRooms(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
