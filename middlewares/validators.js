const { body, param, query, validationResult } = require('express-validator');

exports.validarRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido')
    .isLength({ min: 8, max: 15 }).withMessage('El teléfono debe tener entre 8 y 15 caracteres'),
  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('passwordConfirm')
    .trim()
    .notEmpty().withMessage('La confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

exports.validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password').trim().notEmpty().withMessage('La contraseña es requerida')
];

exports.validarCabana = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es requerida'),
  body('precio')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0')
    .toFloat(),
  body('capacidad')
    .isInt({ gt: 0 }).withMessage('La capacidad debe ser mayor a 0')
    .toInt(),
  body('imagen')
    .optional()
    .isURL().withMessage('La imagen debe ser una URL válida')
];

exports.validarServicio = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('descripcion').trim().optional(),
  body('precio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
    .toFloat()
];

exports.validarReserva = [
  body('cabana_id')
    .notEmpty().withMessage('El ID de la cabaña es requerido')
    .isInt({ gt: 0 }).withMessage('ID de cabaña inválido')
    .toInt(),
  body('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isISO8601().withMessage('Fecha inválida (formato YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) < new Date()) {
        throw new Error('La fecha de inicio no puede ser en el pasado');
      }
      return true;
    }),
  body('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es requerida')
    .isISO8601().withMessage('Fecha inválida (formato YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.fecha_inicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('adultos')
    .notEmpty().withMessage('El número de adultos es requerido')
    .isInt({ gt: 0 }).withMessage('Debe haber al menos 1 adulto')
    .toInt(),
  body('ninos')
    .optional()
    .isInt({ min: 0 }).withMessage('El número de niños no puede ser negativo')
    .toInt(),
  body('servicios')
    .optional()
    .isArray().withMessage('Los servicios deben ser un array de IDs')
];

exports.validarId = [
  param('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ gt: 0 }).withMessage('ID inválido')
    .toInt()
];

exports.validarDisponibilidad = [
  query('fechaInicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isISO8601().withMessage('Formato de fecha inválido (use YYYY-MM-DD)')
    .custom((value, { req }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const inputDate = new Date(value);
      if (inputDate < today) {
        throw new Error('No se pueden buscar fechas en el pasado');
      }
      return true;
    })
    .toDate(),

  query('fechaFin')
    .notEmpty().withMessage('La fecha de fin es requerida')
    .isISO8601().withMessage('Formato de fecha inválido (use YYYY-MM-DD)')
    .custom((value, { req }) => {
      const startDate = new Date(req.query.fechaInicio);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      const maxDays = 30;
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > maxDays) {
        throw new Error(`El período de búsqueda no puede exceder ${maxDays} días`);
      }
      
      return true;
    })
    .toDate(),

  query('adultos')
    .optional()
    .default(1)
    .isInt({ min: 1, max: 10 }).withMessage('Debe haber entre 1 y 10 adultos')
    .toInt(),

  query('ninos')
    .optional()
    .default(0)
    .isInt({ min: 0, max: 10 }).withMessage('Máximo 10 niños permitidos')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(err => ({
        param: err.param,
        message: err.msg,
        value: err.value
      }));
      
      return res.status(400).json({
        status: 'fail',
        message: 'Error de validación en los parámetros',
        errors: formattedErrors
      });
    }
    
    req.query.fechaInicio = new Date(req.query.fechaInicio);
    req.query.fechaFin = new Date(req.query.fechaFin);
    req.query.adultos = parseInt(req.query.adultos || 1);
    req.query.ninos = parseInt(req.query.ninos || 0);
    
    next();
  }
];