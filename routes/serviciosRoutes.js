const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');
const { auth, restrictToAdmin } = require('../middlewares/auth');
const { validarServicio, validarId } = require('../middlewares/validators');

router
  .route('/')
  .get(serviciosController.obtenerServicios)
  .post(auth, restrictToAdmin, validarServicio, serviciosController.crearServicio);

router
  .route('/:id')
  .get(validarId, serviciosController.obtenerServicio)
  .patch(auth, restrictToAdmin, validarId, validarServicio, serviciosController.actualizarServicio)
  .delete(auth, restrictToAdmin, validarId, serviciosController.eliminarServicio);

module.exports = router;