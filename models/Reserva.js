const { pool } = require('../config/db');

class Reserva {
  static async findAll() {
    const query = `
      SELECT r.*, c.nombre as cabana_nombre, u.nombre as usuario_nombre
      FROM reservas r
      JOIN cabanas c ON r.cabana_id = c.id
      JOIN usuarios u ON r.usuario_id = u.id
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT r.*, c.nombre as cabana_nombre
      FROM reservas r
      JOIN cabanas c ON r.cabana_id = c.id
      WHERE r.usuario_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT r.*, c.nombre as cabana_nombre, u.nombre as usuario_nombre
      FROM reservas r
      JOIN cabanas c ON r.cabana_id = c.id
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ usuario_id, cabana_id, fecha_inicio, fecha_fin, adultos, ninos, total, servicios = [] }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar reserva
      const reservaQuery = `
        INSERT INTO reservas (usuario_id, cabana_id, fecha_inicio, fecha_fin, adultos, ninos, total)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const reservaValues = [usuario_id, cabana_id, fecha_inicio, fecha_fin, adultos, ninos, total];
      const { rows } = await client.query(reservaQuery, reservaValues);
      const nuevaReserva = rows[0];

      // Insertar servicios de la reserva
      if (servicios.length > 0) {
        for (const servicioId of servicios) {
          await client.query(
            'INSERT INTO reserva_servicios (reserva_id, servicio_id) VALUES ($1, $2)',
            [nuevaReserva.id, servicioId]
          );
        }
      }

      await client.query('COMMIT');
      return nuevaReserva;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async cancel(id) {
    const query = `
      UPDATE reservas
      SET estado = 'cancelada', actualizado_en = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Reserva;