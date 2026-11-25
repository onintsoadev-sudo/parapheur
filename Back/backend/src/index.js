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

app.listen(PORT, () => {
  console.log(`Serveur e-parapheur démarré sur http://localhost:${PORT}`);
  console.log(`API disponible sous http://localhost:${PORT}/api`);
});
