// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/** POST /api/auth/register */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatarUrl } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son requeridos' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Falta JWT_SECRET' });
    }

    // Normaliza datos
    const nameN = String(name).trim();
    const emailN = String(email).toLowerCase().trim();

    // Evita duplicados por email (case-insensitive)
    const exists = await User.findOne({ email: emailN });
    if (exists) return res.status(400).json({ message: 'El usuario ya existe' });

    // Hash de contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Crea usuario
    const user = await User.create({
      name: nameN,
      email: emailN,
      password: hashed,
      avatarUrl: avatarUrl || ''
    });

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      message: 'Registro exitoso'
    });
  } catch (err) {
    console.error(err);
    // Maneja error de índice único (por si hay race-condition)
    if (err && err.code === 11000) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    return res.status(500).json({ message: 'Error al registrar' });
  }
});

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Falta JWT_SECRET' });
    }

    // Normaliza email para que coincida con lo guardado en DB
    const emailN = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: emailN });
    if (!user) return res.status(400).json({ message: 'Credenciales no válidas' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Credenciales no válidas' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

module.exports = router;
