const Cabana = require('../models/Cabana');
const { validationResult } = require('express-validator');

exports.obtenerCabanas = async (req, res) => {
  try {
    const cabanas = await Cabana.findAll();
    res.status(200).json(cabanas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al obtener las cabañas',
      details: error.message
    });
  }
};

exports.obtenerCabana = async (req, res) => {
  try {
    const cabana = await Cabana.findById(req.params.id);
    
    if (!cabana) {
      return res.status(404).json({
        error: 'No se encontró la cabaña con ese ID'
      });
    }

    if (!cabana.imagen) {
      cabana.imagen = 'https://via.placeholder.com/800x600?text=Imagen+no+disponible';
    }

    res.status(200).json(cabana);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al obtener la cabaña',
      details: error.message
    });
  }
};

exports.obtenerCabanasDestacadas = async (req, res) => {
  try {
    const cabanas = await Cabana.findDestacadas();
    
    const cabanasConImagen = cabanas.map(cabana => ({
      ...cabana,
      imagen: cabana.imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
    }));
    
    res.status(200).json(cabanasConImagen);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al obtener cabañas destacadas',
      details: error.message
    });
  }
};

exports.obtenerCabanasDisponibles = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, adultos, ninos } = req.query;
    
    // Validaciones
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        error: 'Debe proporcionar ambas fechas (inicio y fin)'
      });
    }

    // Validar formato de fechas
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
      return res.status(400).json({
        error: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (inicio >= fin) {
      return res.status(400).json({
        error: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Validar y convertir números
    const adultosNum = parseInt(adultos);
    const ninosNum = parseInt(ninos || 0);
    
    if (isNaN(adultosNum)) {
      return res.status(400).json({
        error: 'Número de adultos inválido'
      });
    }

    if (isNaN(ninosNum)) {
      return res.status(400).json({
        error: 'Número de niños inválido'
      });
    }

    const cabanas = await Cabana.findDisponibles(
      fechaInicio,
      fechaFin,
      adultosNum,
      ninosNum
    );
    
    const cabanasConImagen = cabanas.map(cabana => ({
      ...cabana,
      imagen: cabana.imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
    }));
    
    res.status(200).json(cabanasConImagen);
  } catch (error) {
    console.error("Error en obtenerCabanasDisponibles:", error);
    
    if (error.code === '42725') {
      return res.status(500).json({
        error: 'Error en el servidor al procesar la búsqueda',
        details: 'Problema con los tipos de datos en la consulta'
      });
    }
    
    res.status(500).json({
      error: 'Error al buscar cabañas disponibles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.crearCabana = async (req, res) => {
  try {
    const datosCabana = {
      ...req.body,
      imagen: req.body.imagen || 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'
    };

    const nuevaCabana = await Cabana.create(datosCabana);
    res.status(201).json(nuevaCabana);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al crear la cabaña',
      details: error.message
    });
  }
};

exports.actualizarCabana = async (req, res) => {
  try {
    const cabana = await Cabana.update(req.params.id, req.body);
    if (!cabana) {
      return res.status(404).json({
        error: 'No se encontró la cabaña con ese ID'
      });
    }
    res.status(200).json(cabana);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al actualizar la cabaña',
      details: error.message
    });
  }
};

exports.eliminarCabana = async (req, res) => {
  try {
    const cabana = await Cabana.delete(req.params.id);
    if (!cabana) {
      return res.status(404).json({
        error: 'No se encontró la cabaña con ese ID'
      });
    }
    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al eliminar la cabaña',
      details: error.message
    });
  }
};