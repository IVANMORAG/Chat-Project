const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre para la sala'],
    trim: true,
    maxlength: [50, 'El nombre no puede ser mayor a 50 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción'],
    maxlength: [500, 'La descripción no puede ser mayor a 500 caracteres']
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', RoomSchema);
