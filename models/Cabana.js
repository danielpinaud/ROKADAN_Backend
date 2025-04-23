const { pool } = require('../config/db');

class Cabana {
  static async findAll() {
    const query = 'SELECT * FROM cabanas WHERE disponible = true';
    const { rows } = await pool.query(query);
    
    // Asegurar que todas las cabañas tengan imagen
    return rows.map(row => ({
      ...row,
      imagen: row.imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
    }));
  }

  static async findById(id) {
    const query = 'SELECT * FROM cabanas WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Asegurar que la cabaña tenga imagen
    return {
      ...rows[0],
      imagen: rows[0].imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
    };
  }

  static async findDestacadas() {
    const query = `
      SELECT * FROM cabanas 
      WHERE disponible = true 
      ORDER BY creado_en DESC 
      LIMIT 2
    `;
    const { rows } = await pool.query(query);
    
    // Asegurar que las cabañas destacadas tengan imagen
    return rows.map(row => ({
      ...row,
      imagen: row.imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
    }));
  }

  static async findDisponibles(fechaInicio, fechaFin, adultos, ninos) {
    try {
      // Convertir parámetros a tipos explícitos
      adultos = parseInt(adultos) || 1;
      ninos = parseInt(ninos) || 0;
      const capacidadTotal = adultos + ninos;

      const query = `
        SELECT c.* 
        FROM cabanas c
        WHERE c.disponible = true
        AND c.capacidad >= $1
        AND c.id NOT IN (
          SELECT r.cabana_id 
          FROM reservas r
          WHERE r.estado != 'cancelada'
          AND (
            (r.fecha_inicio <= $2::date AND r.fecha_fin >= $2::date) OR
            (r.fecha_inicio <= $3::date AND r.fecha_fin >= $3::date) OR
            (r.fecha_inicio >= $2::date AND r.fecha_fin <= $3::date)
          )
        )
      `;
      
      const { rows } = await pool.query(query, [
        capacidadTotal,
        fechaInicio,
        fechaFin
      ]);
      
      return rows.map(row => ({
        ...row,
        imagen: row.imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
      }));
    } catch (error) {
      console.error("Error en findDisponibles:", error);
      throw error;
    }
  }

  static async create({ nombre, descripcion, precio, capacidad, imagen }) {
    const query = `
      INSERT INTO cabanas (nombre, descripcion, precio, capacidad, imagen)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      nombre,
      descripcion,
      precio,
      capacidad,
      imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { nombre, descripcion, precio, capacidad, imagen, disponible }) {
    const query = `
      UPDATE cabanas
      SET nombre = $1, descripcion = $2, precio = $3, capacidad = $4, imagen = $5, disponible = $6, actualizado_en = NOW()
      WHERE id = $7
      RETURNING *
    `;
    const values = [
      nombre,
      descripcion,
      precio,
      capacidad,
      imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible',
      disponible,
      id
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM cabanas WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Cabana;