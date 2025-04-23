const { pool } = require('../config/db');

class Servicio {
  static async findAll() {
    const query = 'SELECT * FROM servicios WHERE activo = true ORDER BY nombre';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findAllAdmin() {
    const query = 'SELECT * FROM servicios ORDER BY nombre';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM servicios WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ nombre, descripcion, precio }) {
    const query = `
      INSERT INTO servicios (nombre, descripcion, precio)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [nombre, descripcion, precio];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { nombre, descripcion, precio, activo }) {
    const query = `
      UPDATE servicios
      SET nombre = $1, 
          descripcion = $2, 
          precio = $3, 
          activo = $4,
          actualizado_en = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const values = [nombre, descripcion, precio, activo, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM servicios WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByIds(ids) {
    const query = 'SELECT * FROM servicios WHERE id = ANY($1::int[])';
    const { rows } = await pool.query(query, [ids]);
    return rows;
  }

  static async toggleActivo(id) {
    const query = `
      UPDATE servicios
      SET activo = NOT activo,
          actualizado_en = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Servicio;