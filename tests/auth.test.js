const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/db');
const Usuario = require('../models/Usuario');

// Configuración de usuarios de prueba
const testUser = {
  nombre: 'Test',
  apellido: 'User',
  email: 'test-auth@example.com', // Email único para cada test
  telefono: '912345678',
  password: 'password123'
};

const adminUser = {
  nombre: 'Admin',
  apellido: 'Rokadan',
  email: 'admin@cabanas.com', // Email único para admin
  telefono: '987654321',
  password: 'admin123',
  es_admin: true
};

describe('Auth API', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Limpiar usuarios de prueba previos
    await pool.query('DELETE FROM usuarios WHERE email IN ($1, $2)', [
      testUser.email,
      adminUser.email
    ]);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/registrar', () => {
    it('debería registrar un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/auth/registrar')
        .send({
          ...testUser,
          passwordConfirm: testUser.password
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data.usuario.email).toEqual(testUser.email);
      userToken = res.body.token;
    });

    it('debería fallar si el email ya está registrado', async () => {
      const res = await request(app)
        .post('/api/auth/registrar')
        .send({
          ...testUser, // Mismo email que el test anterior
          passwordConfirm: testUser.password
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/ya existe|existente/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      userToken = res.body.token;
    });

    it('debería fallar con credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toMatch(/incorrectos|inválidas/i);
    });
  });

  describe('Admin Auth', () => {
    beforeAll(async () => {
      // Crear usuario admin directamente para evitar dependencia del endpoint
      await Usuario.create(adminUser);
      
      // Login como admin
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        });
      
      adminToken = loginRes.body.token;
      console.log('Admin Token:', adminToken); // Para debug
    });

    it('debería reconocer al usuario como administrador', async () => {
        expect(adminToken).toBeDefined();
      const res = await request(app)
        .get('/api/auth/me') // Asumiendo que tienes esta ruta
        .set('Authorization', `Bearer ${adminToken}`);

        // Debug si falla
        if (res.statusCode !== 200) {
        console.log('Error response:', res.body);
        }

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.usuario.email).toEqual(adminUser.email);
      expect(res.body.data.usuario.es_admin).toBe(true);
    });
  });
});