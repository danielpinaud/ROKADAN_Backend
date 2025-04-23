const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/db');
const { generateToken } = require('../config/jwt');

let adminToken;
let userToken;

beforeAll(async () => {
  // Obtener token de admin
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@cabanas.com',
      password: 'admin123'
    });
  adminToken = adminRes.body.token;

  // Obtener token de usuario normal
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });
  userToken = userRes.body.token;
});

afterAll(async () => {
  await pool.end();
});

describe('Servicios API', () => {
  describe('GET /api/servicios', () => {
    it('debería obtener todos los servicios', async () => {
      const res = await request(app)
        .get('/api/servicios')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.servicios.length).toBeGreaterThan(0);
    });
  });

  describe('Operaciones de administrador', () => {
    it('debería crear un nuevo servicio (admin)', async () => {
      const nuevoServicio = {
        nombre: 'Servicio Test',
        descripcion: 'Descripción de prueba',
        precio: 5000
      };

      const res = await request(app)
        .post('/api/servicios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevoServicio);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.servicio.nombre).toEqual(nuevoServicio.nombre);
    });

    it('debería fallar al crear servicio sin autenticación', async () => {
      const res = await request(app)
        .post('/api/servicios')
        .send({
          nombre: 'Servicio Test',
          precio: 5000
        });

      expect(res.statusCode).toEqual(401);
    });

    it('debería fallar al crear servicio como usuario normal', async () => {
      const res = await request(app)
        .post('/api/servicios')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nombre: 'Servicio Test',
          precio: 5000
        });

      expect(res.statusCode).toEqual(403);
    });
  });
});