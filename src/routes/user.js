const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

const router = express.Router();


// GET /api/user?role=engineer  -> lista usuarios (solo lectura)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;            // e.g. role=engineer
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('name email avatarUrl role'); // campos que necesita el front

    return res.json(users);
  } catch (err) {
    console.error('GET /api/user error', err);
    return res.status(500).json({ message: 'Error al listar usuarios' });
  }
});


/** POST /api/user/avatar */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se adjuntó ninguna imagen' });

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { avatarUrl },
      { new: true }
    );

    return res.json({ message: 'Foto de perfil actualizada', user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al subir la foto' });
  }
});

module.exports = router;
