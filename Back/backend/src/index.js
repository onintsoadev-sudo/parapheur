require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Toutes les routes de l'API sous /api (comme Laravel)
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'e-parapheur API (Express.js)',
    version: '1.0.0',
    status: 'ok',
  });
});

// Gestion d'erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur',
  });
});

const server = app.listen(PORT, () => {
  console.log(`Serveur e-parapheur démarré sur http://localhost:${PORT}`);
  console.log(`API disponible sous http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERREUR] Le port ${PORT} est déjà utilisé par un autre processus.`);
    console.error('Identifiez-le avec : netstat -ano | grep ":' + PORT + '"');
    console.error('Puis arrêtez-le avec : taskkill //PID <PID> //F\n');
  } else {
    console.error('[ERREUR] Impossible de démarrer le serveur :', err.message);
  }
  process.exit(1);
});

// Un rejet de promesse non géré ne doit pas tuer silencieusement le serveur.
process.on('unhandledRejection', (reason) => {
  console.error('[ERREUR] Promesse rejetée sans gestion :', reason);
});

// Arrêt propre : on libère le port et le pool PostgreSQL avant de sortir,
// sinon le prochain démarrage (ou `node --watch`) tombe sur EADDRINUSE.
function shutdown(signal) {
  console.log(`[${signal}] Arrêt du serveur...`);
  const timeout = setTimeout(() => process.exit(1), 5000);
  timeout.unref();

  server.close(() => {
    const db = require('./config/db');
    db.pool.end().then(() => process.exit(0)).catch(() => process.exit(0));
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
