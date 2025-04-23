const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { validarRegistro, validarLogin } = require('../middlewares/validators');

router.post('/registrar', validarRegistro, authController.registrar);
router.post('/login', validarLogin, authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;