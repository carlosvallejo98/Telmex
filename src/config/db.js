const mongoose = require('mongoose');

module.exports = async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Falta MONGO_URI en .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { dbName: uri.split('/').pop() });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
};
