const db = require('../config/db');

/**
 * POST /api/support
 */
async function sendMessage(req, res) {
  try {
    const { email, objet, message } = req.body;
    if (!email || !objet || !message) {
      return res.status(422).json({ message: 'Champs requis manquants' });
    }
    await db.query(
      `INSERT INTO supports (email, objet, message, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [email, objet, message]
    );
    return res.json({ message: 'Message envoyé avec succès' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/getMessages
 */
async function getMessages(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM supports ORDER BY created_at DESC');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * DELETE /api/deleteMessages/:id
 */
async function deleteMessages(req, res) {
  try {
    await db.query('DELETE FROM supports WHERE su_id = $1', [req.params.id]);
    return res.json({ message: 'Message bien supprime' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * DELETE /api/messages/deleteAll
 */
async function deleteAllMessages(req, res) {
  try {
    await db.query('DELETE FROM supports');
    return res.json({ message: 'Tous les messages ont ete bien supprime' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { sendMessage, getMessages, deleteMessages, deleteAllMessages };
