require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDb = require('./config/db');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');
const userRoutes = require('./routes/user');

// NUEVO
const ticketsRoutes = require('./routes/tickets');
const reportRoutes = require('./routes/report');

// Conectar a la base de datos
connectDb();

const app = express();

// CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Estáticos (subidas)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/historial', historyRoutes);
app.use('/api/user', userRoutes);

// NUEVO
app.use('/api/tickets', ticketsRoutes);
app.use('/api', reportRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(` Servidor corriendo en puerto ${PORT}`);
});
