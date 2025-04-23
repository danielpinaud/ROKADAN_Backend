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

describe('Cabañas API', () => {
  describe('GET /api/cabanas', () => {
    it('debería obtener todas las cabañas', async () => {
      const res = await request(app)
        .get('/api/cabanas')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.cabanas.length).toBeGreaterThan(0);
    });

    it('debería obtener una cabaña específica', async () => {
      const res = await request(app)
        .get('/api/cabanas/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.cabana.id).toEqual(1);
    });
  });

  describe('Operaciones de administrador', () => {
    it('debería crear una nueva cabaña (admin)', async () => {
      const nuevaCabana = {
        nombre: 'Cabaña Test',
        descripcion: 'Descripción de prueba',
        precio: 30000,
        capacidad: 4
      };

      const res = await request(app)
        .post('/api/cabanas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaCabana);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.cabana.nombre).toEqual(nuevaCabana.nombre);
    });

    it('debería fallar al crear cabaña sin autenticación', async () => {
      const res = await request(app)
        .post('/api/cabanas')
        .send({
          nombre: 'Cabaña Test',
          descripcion: 'Descripción de prueba',
          precio: 30000,
          capacidad: 4
        });

      expect(res.statusCode).toEqual(401);
    });

    it('debería fallar al crear cabaña como usuario normal', async () => {
      const res = await request(app)
        .post('/api/cabanas')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nombre: 'Cabaña Test',
          descripcion: 'Descripción de prueba',
          precio: 30000,
          capacidad: 4
        });

      expect(res.statusCode).toEqual(403);
    });
  });
});