const express = require('express');
const {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  getMyRooms,
  getRoomMembers
} = require('../controllers/roomController');
const { validateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', validateToken, createRoom);
router.get('/', validateToken, getRooms);
router.get('/my', validateToken, getMyRooms);
router.get('/:id', validateToken, getRoomById);
router.post('/:id/join', validateToken, joinRoom);
router.post('/:id/leave', validateToken, leaveRoom);
router.get('/:id/members', validateToken, getRoomMembers);

module.exports = router;
