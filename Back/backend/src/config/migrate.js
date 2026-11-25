/**
 * Script de migration (optionnel).
 * Si vous utilisez déjà la base créée par Laravel, vous n'avez PAS besoin de lancer ce script.
 * Il sert uniquement à créer les tables depuis zéro.
 */
const db = require('./db');

const sql = `
-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  id_dir INTEGER NOT NULL,
  id_serv INTEGER NOT NULL,
  im VARCHAR(255) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'desactive')) DEFAULT 'active',
  role VARCHAR(20) CHECK (role IN ('admin', 'sp', 'serv', 'scc', 'agent')) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  email VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL
);

-- dgs
CREATE TABLE IF NOT EXISTS dgs (
  dg_id SERIAL PRIMARY KEY,
  nom_dg VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- dirs
CREATE TABLE IF NOT EXISTS dirs (
  d_id SERIAL PRIMARY KEY,
  nom_dir VARCHAR(255) NOT NULL,
  porte_dir VARCHAR(255) NOT NULL,
  dg_id INTEGER REFERENCES dgs(dg_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- servs
CREATE TABLE IF NOT EXISTS servs (
  s_id SERIAL PRIMARY KEY,
  nom_serv VARCHAR(255) NOT NULL,
  porte_serv VARCHAR(255) NOT NULL,
  dir_id INTEGER REFERENCES dirs(d_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- courriers
CREATE TABLE IF NOT EXISTS courriers (
  c_id SERIAL PRIMARY KEY,
  provenance VARCHAR(255) NOT NULL,
  chrono VARCHAR(255) NOT NULL,
  cin VARCHAR(255) NOT NULL,
  tel VARCHAR(255) NOT NULL,
  ref VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  dir_id INTEGER REFERENCES dirs(d_id) ON DELETE CASCADE,
  motif VARCHAR(255) NOT NULL,
  caracteristique TEXT NOT NULL,
  proprietaire VARCHAR(255) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('reçu', 'non reçu')) DEFAULT 'non reçu',
  transfere VARCHAR(10) CHECK (transfere IN ('oui', 'non')) DEFAULT 'non',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- mouvements
CREATE TABLE IF NOT EXISTS mouvements (
  m_id SERIAL PRIMARY KEY,
  ref_initial VARCHAR(255) NOT NULL,
  ref_propre VARCHAR(255) NOT NULL,
  id_dg VARCHAR(255) NOT NULL,
  courrier_id INTEGER REFERENCES courriers(c_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) CHECK (type IN ('transfert', 'recuperation')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('reçu', 'non reçu')) DEFAULT 'non reçu',
  serv_id VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  transfere VARCHAR(10) CHECK (transfere IN ('non', 'oui')) DEFAULT 'non',
  current_trans_id INTEGER NOT NULL,
  current_trans_id_dir INTEGER NOT NULL,
  propr VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- visitors
CREATE TABLE IF NOT EXISTS visitors (
  v_id SERIAL PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  nbr INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- supports
CREATE TABLE IF NOT EXISTS supports (
  su_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  objet VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tokens JWT (équivalent simplifié de personal_access_tokens)
CREATE TABLE IF NOT EXISTS personal_access_tokens (
  id SERIAL PRIMARY KEY,
  tokenable_type VARCHAR(255),
  tokenable_id INTEGER,
  name VARCHAR(255),
  token VARCHAR(64) UNIQUE,
  abilities TEXT,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
  try {
    await db.query(sql);
    console.log('Migrations exécutées avec succès.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur migration:', err);
    process.exit(1);
  }
}

migrate();
