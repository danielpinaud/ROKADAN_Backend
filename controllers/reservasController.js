const Reserva = require('../models/Reserva');
const Cabana = require('../models/Cabana');
const Servicio = require('../models/Servicio');
const { validationResult } = require('express-validator');

exports.obtenerReservas = async (req, res) => {
  try {
    let reservas;
    if (req.user.es_admin) {
      reservas = await Reserva.findAll();
    } else {
      reservas = await Reserva.findByUserId(req.user.id);
    }
    
    res.status(200).json({
      status: 'success',
      results: reservas.length,
      data: {
        reservas
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener las reservas.'
    });
  }
};

exports.obtenerReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reserva con ese ID.'
      });
    }

    // Verificar que el usuario es dueño de la reserva o es admin
    if (reserva.usuario_id !== req.user.id && !req.user.es_admin) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permiso para acceder a esta reserva.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        reserva
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener la reserva.'
    });
  }
};

exports.crearReserva = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar que la cabaña existe
    const cabana = await Cabana.findById(req.body.cabana_id);
    if (!cabana) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la cabaña con ese ID.'
      });
    }

    // Verificar que los servicios existen
    if (req.body.servicios && req.body.servicios.length > 0) {
      for (const servicioId of req.body.servicios) {
        const servicio = await Servicio.findById(servicioId);
        if (!servicio) {
          return res.status(404).json({
            status: 'fail',
            message: `No se encontró el servicio con ID ${servicioId}.`
          });
        }
      }
    }

    // Calcular el total
    const dias = (new Date(req.body.fecha_fin) - new Date(req.body.fecha_inicio)) / (1000 * 60 * 60 * 24);
    let total = cabana.precio * dias;

    // Agregar costo de servicios
    if (req.body.servicios && req.body.servicios.length > 0) {
      for (const servicioId of req.body.servicios) {
        const servicio = await Servicio.findById(servicioId);
        total += servicio.precio * dias;
      }
    }

    // Crear la reserva
    const nuevaReserva = await Reserva.create({
      usuario_id: req.user.id,
      cabana_id: req.body.cabana_id,
      fecha_inicio: req.body.fecha_inicio,
      fecha_fin: req.body.fecha_fin,
      adultos: req.body.adultos,
      ninos: req.body.ninos || 0,
      total,
      servicios: req.body.servicios || []
    });

    res.status(201).json({
      status: 'success',
      data: {
        reserva: nuevaReserva
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear la reserva.'
    });
  }
};

exports.cancelarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reserva con ese ID.'
      });
    }

    // Verificar que el usuario es dueño de la reserva o es admin
    if (reserva.usuario_id !== req.user.id && !req.user.es_admin) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permiso para cancelar esta reserva.'
      });
    }

    // Solo se puede cancelar si está pendiente o confirmada
    if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Solo se pueden cancelar reservas pendientes o confirmadas.'
      });
    }

    const reservaCancelada = await Reserva.cancel(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        reserva: reservaCancelada
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al cancelar la reserva.'
    });
  }
};