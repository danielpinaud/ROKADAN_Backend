const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Configuración optimizada para Render.com
const connectionConfig = {
  connectionString: isProduction 
    ? process.env.DATABASE_URL 
    : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  
  ssl: isProduction 
    ? { 
        rejectUnauthorized: false, // Necesario para Render PostgreSQL
        ca: process.env.CA_CERT?.replace(/\\n/g, '\n') // Para certificados personalizados
      } 
    : false, // SSL opcional en desarrollo
  
  // Configuraciones de pool recomendadas para producción
  ...(isProduction && {
    max: 20,                // Máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  }),
  
  allowExitOnIdle: true
};

// Validación crítica en producción
if (isProduction && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in production');
}

const pool = new Pool(connectionConfig);

// Manejador de errores mejorado
pool.on('error', (err) => {
  console.error('⚠️ Error fatal en el pool de PostgreSQL:', err.stack || err);
  process.exit(-1);
});

// Función de conexión con verificación
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a PostgreSQL exitosa:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Error al conectar a PostgreSQL:', {
      error: err.message,
      config: {
        host: connectionConfig.connectionString?.split('@')[1]?.split(':')[0] || 'localhost',
        port: connectionConfig.connectionString?.split(':')[3]?.split('/')[0] || '5432',
        database: connectionConfig.connectionString?.split('/').pop() || process.env.DB_NAME,
        ssl: connectionConfig.ssl ? 'activado' : 'desactivado'
      }
    });
    return false;
  }
};

// Exportaciones
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection // Exportamos para usarla en server.js
};