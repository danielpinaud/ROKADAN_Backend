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

describe('Reservas API', () => {
  describe('POST /api/reservas', () => {
    it('debería crear una nueva reserva', async () => {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() + 7);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + 3);

      const nuevaReserva = {
        cabana_id: 1,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        adultos: 2,
        ninos: 1,
        servicios: [1, 3]
      };

      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${userToken}`)
        .send(nuevaReserva);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.reserva.usuario_id).toBeDefined();
    });

    it('debería fallar con fechas inválidas', async () => {
      const res = await request(app)
        .post('/api/reservas')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          cabana_id: 1,
          fecha_inicio: '2023-01-01',
          fecha_fin: '2022-12-31',
          adultos: 2
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/reservas', () => {
    it('debería obtener las reservas del usuario', async () => {
      const res = await request(app)
        .get('/api/reservas')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.reservas.length).toBeGreaterThan(0);
    });

    it('admin debería obtener todas las reservas', async () => {
      const res = await request(app)
        .get('/api/reservas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.reservas.length).toBeGreaterThan(0);
    });
  });
});