const express = require('express');
const History = require('../models/History');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/** Todas requieren auth */
router.use(authMiddleware);

/** POST /api/historial */
router.post('/', async (req, res) => {
  try {
    const { ticketId, fecha, hora, dia, contenido, empresa } = req.body;

    const history = new History({
      userId: req.userId,
      ticketId,
      fecha,
      hora,
      dia,
      contenido,
      empresa
    });

    await history.save();
    return res.status(201).json({ message: 'Historial guardado correctamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al guardar historial' });
  }
});

/** GET /api/historial */
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.ticketId) {
          const q = String(req.query.ticketId);
          // si parece ObjectId, usa el string (Mongoose lo castea); si no, intenta número (compat)
        filter.ticketId = /^[0-9a-fA-F]{24}$/.test(q) ? q : Number(q);
       }
    const histories = await History.find(filter).sort({ createdAt: -1 });
    return res.json(histories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener historiales' });
  }
});

module.exports = router;
