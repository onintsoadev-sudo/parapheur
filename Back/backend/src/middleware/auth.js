const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Middleware d'authentification (équivalent Sanctum)
 * Attend un header: Authorization: Bearer <token>
 */
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await db.query(
      `SELECT u.*, d.nom_dir, d.d_id, s.nom_serv, s.s_id
       FROM users u
       LEFT JOIN dirs d ON d.d_id = u.id_dir
       LEFT JOIN servs s ON s.s_id = u.id_serv
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (!rows[0]) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    if (rows[0].status === 'desactive') {
      return res.status(403).json({ message: "Votre compte est Bloque, veuillez informer l'administrateur" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

module.exports = { auth };
