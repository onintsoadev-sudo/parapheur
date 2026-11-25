const db = require('../config/db');

async function index(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM dirs ORDER BY d_id');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function store(req, res) {
  try {
    const { nom_dir, porte_dir, dg_id } = req.body;
    if (!nom_dir || !porte_dir || !dg_id) {
      return res.status(422).json({ message: 'Champs requis manquants' });
    }
    const { rows } = await db.query(
      `INSERT INTO dirs (nom_dir, porte_dir, dg_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      [nom_dir, porte_dir, dg_id]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function show(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM dirs WHERE d_id = $1', [req.params.dir]);
    if (!rows[0]) return res.status(404).json({ message: 'Non trouvé' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const { nom_dir, porte_dir, dg_id } = req.body;
    const { rows } = await db.query(
      `UPDATE dirs SET nom_dir = COALESCE($1, nom_dir), porte_dir = COALESCE($2, porte_dir),
       dg_id = COALESCE($3, dg_id), updated_at = NOW()
       WHERE d_id = $4 RETURNING *`,
      [nom_dir, porte_dir, dg_id, req.params.dir]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Non trouvé' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function destroy(req, res) {
  try {
    await db.query('DELETE FROM dirs WHERE d_id = $1', [req.params.dir]);
    return res.json({ message: 'Supprimé' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { index, store, show, update, destroy };
