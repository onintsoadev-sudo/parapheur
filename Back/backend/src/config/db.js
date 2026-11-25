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
  // Une connexion INACTIVE du pool peut être coupée par PostgreSQL (redémarrage du
  // serveur, timeout réseau, antivirus...). pg retire alors le client défaillant et
  // en recrée un à la requête suivante : ce n'est pas fatal, on loggue sans tuer le serveur.
  console.error('[DB] Connexion inactive perdue (le pool en recréera une):', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
