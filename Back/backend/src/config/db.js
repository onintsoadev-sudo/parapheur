const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_DATABASE || 'parapheur',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '2404',
});

pool.on('error', (err) => {
  console.error('Erreur inattendue du client PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
