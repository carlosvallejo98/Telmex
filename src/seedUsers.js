// src/seedUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDb = require('./config/db');
const User = require('./models/User');

async function seed() {
  await connectDb();

  const users = [
    { name: 'Carlos Vallejo García', email: 'carlos.vallejo@example.com', password: 'contrasenaSegura123', avatarUrl: '' },
    { name: 'Abrham Roberto Medina', email: 'abrham.medina@example.com', password: 'contrasenaSegura123', avatarUrl: '' },
    { name: 'Luis Alejandro Vallejo García', email: 'luis.alejandro.vallejo@example.com', password: 'contrasenaSegura123', avatarUrl: '' },
    { name: 'Supervisor', email: 'supervisor@app.com', password: '123456', avatarUrl: '' }
  ];

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('USANDO DB:', uri);

  for (const data of users) {
    const emailN = String(data.email).toLowerCase().trim();
    const exists = await User.findOne({ email: emailN });
    if (exists) {
      console.log(`Ya existe: ${emailN}`);
      continue;
    }
    const hashed = await bcrypt.hash(data.password, 10);
    await new User({ ...data, email: emailN, password: hashed }).save();
    console.log(`Creado: ${emailN}`);
  }

  await mongoose.connection.close();
  console.log('Seed terminado');
}

seed().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
