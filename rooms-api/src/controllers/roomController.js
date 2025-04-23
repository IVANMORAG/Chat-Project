const Room = require('../models/roomModel');

// @desc    Crear nueva sala
// @route   POST /api/rooms
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    // Crear sala
    const room = await Room.create({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id],
      isPrivate
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todas las salas públicas
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener sala por ID
// @route   GET /api/rooms/:id
// @access  Private
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unirse a una sala
// @route   POST /api/rooms/:id/join
// @access  Private
exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada'
      });
    }

    // Verificar si ya es miembro
    if (room.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Ya eres miembro de esta sala'
      });
    }

    // Unirse a la sala
    room.members.push(req.user.id);
    await room.save();

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Salir de una sala
// @route   POST /api/rooms/:id/leave
// @access  Private
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada'
      });
    }

    // Verificar si es miembro
    if (!room.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'No eres miembro de esta sala'
      });
    }

    // Salir de la sala
    room.members = room.members.filter(
      member => member.toString() !== req.user.id
    );
    await room.save();

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener mis salas
// @route   GET /api/rooms/my
// @access  Private
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Obtener miembros de una sala
// @route   GET /api/rooms/:id/members
// @access  Private
exports.getRoomMembers = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).select('members');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      members: room.members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};