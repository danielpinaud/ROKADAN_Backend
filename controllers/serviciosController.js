const Servicio = require('../models/Servicio');
const { validationResult } = require('express-validator');

exports.obtenerServicios = async (req, res) => {
  try {
    const servicios = await Servicio.findAll();
    res.status(200).json({
      status: 'success',
      results: servicios.length,
      data: {
        servicios
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los servicios.'
    });
  }
};

exports.obtenerServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el servicio con ese ID.'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        servicio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el servicio.'
    });
  }
};

exports.crearServicio = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const nuevoServicio = await Servicio.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        servicio: nuevoServicio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al crear el servicio.'
    });
  }
};

exports.actualizarServicio = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const servicio = await Servicio.update(req.params.id, req.body);
    if (!servicio) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el servicio con ese ID.'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        servicio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el servicio.'
    });
  }
};

exports.eliminarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.delete(req.params.id);
    if (!servicio) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el servicio con ese ID.'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el servicio.'
    });
  }
};