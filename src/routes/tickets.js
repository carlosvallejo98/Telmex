const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');

/**
 * GET /api/tickets
 * - Sin ?all=true: devuelve SOLO los tickets del usuario autenticado.
 * - Con ?all=true: devuelve TODOS los tickets (para la app de supervisión).
 * Filtros: status, priority, q (busca en title/description/cliente/sitio/actividad).
 */
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, q, all } = req.query;

    const filter = {};
    if (all !== 'true') {
      // Vista normal: solo los tickets del usuario autenticado
      filter.assignedTo = req.userId;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [
        { title: rx },
        { description: rx },
        { cliente: rx },
        { sitio: rx },
        { actividad: rx },
      ];
    }

    const items = await Ticket.find(filter)
      .populate('assignedTo', 'name email avatarUrl role') // 👈 añadido para tarjetas
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ items });
  } catch (err) {
    console.error('GET /tickets error', err);
    return res.status(500).json({ error: 'Error fetching tickets' });
  }
});

/**
 * POST /api/tickets
 * Crea un ticket. `assignedTo` puede ser un ObjectId (24 hex) o un email de usuario.
 * Si no se envía, se asigna al usuario autenticado.
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description = '',
      priority = 'normal',
      assignedTo,  // _id 24hex o email
      NV = '',
      ID = '',
      cliente = '',
      sitio = '',
      direccion = '',
      contacto = '',
      telefono = '',
      actividad = '',
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title requerido' });
    }

    // Resolver assignedTo
    let assignedToId = null;
    if (assignedTo) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(assignedTo));
      if (isObjectId) {
        assignedToId = assignedTo;
      } else {
        const u = await User.findOne({ email: assignedTo }).select('_id');
        if (!u) return res.status(400).json({ error: 'assignedTo (email) no encontrado' });
        assignedToId = u._id;
      }
    } else {
      assignedToId = req.userId; // fallback: creador/propio
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      status: 'open',
      createdBy: req.userId,
      assignedTo: assignedToId,

      NV,
      ID,
      cliente,
      sitio,
      direccion,
      contacto,
      telefono,
      actividad,
    });

    return res.status(201).json(ticket);
  } catch (err) {
    console.error('POST /tickets error', err);
    return res.status(500).json({ error: 'Error creating ticket' });
  }
});

module.exports = router;
