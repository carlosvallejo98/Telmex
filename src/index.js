require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDb = require('./config/db');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');
const userRoutes = require('./routes/user');
const ticketsRoutes = require('./routes/tickets');
const reportRoutes = require('./routes/report');

// Conectar a la base de datos
connectDb();

const app = express();

/* =========================
   CORS PERMITIDOS (LOCAL + NETLIFY)
   ========================= */
const allowedOrigins = [
  'http://localhost:3000',
  'https://telmex.netlify.app'
];

const corsOptions = {
  origin(origin, callback) {
    // Permitir peticiones sin origin (curl, health checks, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
};

// ✅ CORS global
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Estáticos (subidas)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/historial', historyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api', reportRoutes);

// Healthcheck útil para Render
app.get('/healthz', (_req, res) => res.json({ ok: true }));

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
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log('CORS_ORIGIN permitidos:', allowedOrigins);
});
