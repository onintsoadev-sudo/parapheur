const db = require('../config/db');

async function index(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM servs ORDER BY s_id');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function store(req, res) {
  try {
    const { nom_serv, porte_serv, dir_id } = req.body;
    if (!nom_serv || !porte_serv || !dir_id) {
      return res.status(422).json({ message: 'Champs requis manquants' });
    }
    const { rows } = await db.query(
      `INSERT INTO servs (nom_serv, porte_serv, dir_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      [nom_serv, porte_serv, dir_id]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function show(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM servs WHERE s_id = $1', [req.params.serv]);
    if (!rows[0]) return res.status(404).json({ message: 'Non trouvé' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const { nom_serv, porte_serv, dir_id } = req.body;
    const { rows } = await db.query(
      `UPDATE servs SET nom_serv = COALESCE($1, nom_serv), porte_serv = COALESCE($2, porte_serv),
       dir_id = COALESCE($3, dir_id), updated_at = NOW()
       WHERE s_id = $4 RETURNING *`,
      [nom_serv, porte_serv, dir_id, req.params.serv]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Non trouvé' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function destroy(req, res) {
  try {
    await db.query('DELETE FROM servs WHERE s_id = $1', [req.params.serv]);
    return res.json({ message: 'Supprimé' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/** GET /api/services/:id_dir */
async function getListOfServByDirection(req, res) {
  try {
    const { rows } = await db.query(
      'SELECT * FROM servs WHERE dir_id = $1 ORDER BY s_id',
      [req.params.id_dir]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { index, store, show, update, destroy, getListOfServByDirection };
