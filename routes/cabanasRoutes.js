const express = require('express');
const router = express.Router();
const cabanasController = require('../controllers/cabanasController');
const { auth, restrictToAdmin } = require('../middlewares/auth');
const { validarCabana, validarId } = require('../middlewares/validators');
const { validarDisponibilidad } = require('../middlewares/validators');

router
  .route('/')
  .get(cabanasController.obtenerCabanas)
  .post(auth, restrictToAdmin, validarCabana, cabanasController.crearCabana);

router
  .route('/destacadas')
  .get(cabanasController.obtenerCabanasDestacadas);

router
  .route('/disponibles')
  .get(validarDisponibilidad, cabanasController.obtenerCabanasDisponibles);

router
  .route('/:id')
  .get(validarId, cabanasController.obtenerCabana)
  .patch(auth, restrictToAdmin, validarId, validarCabana, cabanasController.actualizarCabana)
  .delete(auth, restrictToAdmin, validarId, cabanasController.eliminarCabana);

module.exports = router;