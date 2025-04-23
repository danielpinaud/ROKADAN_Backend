const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const { auth } = require('../middlewares/auth');
const { validarReserva, validarId } = require('../middlewares/validators');

router.use(auth);

router
  .route('/')
  .get(reservasController.obtenerReservas)
  .post(validarReserva, reservasController.crearReserva);

router
  .route('/:id')
  .get(validarId, reservasController.obtenerReserva);

router
  .route('/:id/cancelar')
  .patch(validarId, reservasController.cancelarReserva);

module.exports = router;