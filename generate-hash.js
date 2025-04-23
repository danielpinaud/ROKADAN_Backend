const bcrypt = require('bcrypt');

async function generateHash() {
  // "admin123" es la nueva contraseña que quieres usar
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Hash generado:', hash);
}

generateHash();