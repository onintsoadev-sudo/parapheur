const db = require('../config/db');

async function index(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM dgs ORDER BY dg_id');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function store(req, res) {
  try {
    const { nom_dg } = req.body;
    if (!nom_dg) return res.status(422).json({ message: 'nom_dg requis' });
    const { rows } = await db.query(
      'INSERT INTO dgs (nom_dg, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
      [nom_dg]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function show(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM dgs WHERE dg_id = $1', [req.params.dg]);
    if (!rows[0]) return res.status(404).json({ message: 'Non trouvé' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const { nom_dg } = req.body;
    const { rows } = await db.query(
      'UPDATE dgs SET nom_dg = $1, updated_at = NOW() WHERE dg_id = $2 RETURNING *',
      [nom_dg, req.params.dg]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Non trouvé' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function destroy(req, res) {
  try {
    await db.query('DELETE FROM dgs WHERE dg_id = $1', [req.params.dg]);
    return res.json({ message: 'Supprimé' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { index, store, show, update, destroy };
