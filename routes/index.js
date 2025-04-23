const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const cabanasRoutes = require('./cabanasRoutes');
const serviciosRoutes = require('./serviciosRoutes');
const reservasRoutes = require('./reservasRoutes');

router.use('/auth', authRoutes);
router.use('/cabanas', cabanasRoutes);
router.use('/servicios', serviciosRoutes);
router.use('/reservas', reservasRoutes);

module.exports = router;