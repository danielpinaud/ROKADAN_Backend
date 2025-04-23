const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class Usuario {
  static async create({ nombre, apellido, email, telefono, password, es_admin = false }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO usuarios (nombre, apellido, email, telefono, password, es_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, apellido, email, telefono, es_admin, creado_en, actualizado_en
    `;
    const values = [nombre, apellido, email, telefono, hashedPassword, es_admin];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, nombre, apellido, email, telefono, es_admin FROM usuarios WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async comparePasswords(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = Usuario;