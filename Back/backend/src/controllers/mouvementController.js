const db = require('../config/db');

function paginate(rows, page, perPage, total) {
  return {
    data: rows,
    current_page: page,
    per_page: perPage,
    total,
    last_page: Math.ceil(total / perPage) || 1,
  };
}

/**
 * POST /api/transDoc
 */
async function makeMovement(req, res) {
  try {
    const {
      ref_initial, ref_propre, courrier_id, user_id, type, status,
      propr, description, transfere, serv_id, current_trans_id, id_dg, current_trans_id_dir,
    } = req.body;

    if (!ref_initial || !ref_propre || !courrier_id || !user_id || !type || !status || !description || !transfere || !serv_id || !current_trans_id || !id_dg || !current_trans_id_dir) {
      return res.status(422).json({ message: 'Champs requis manquants' });
    }

    await db.query(
      `INSERT INTO mouvements
        (ref_initial, ref_propre, courrier_id, user_id, type, status, propr, description, transfere, serv_id, current_trans_id, id_dg, current_trans_id_dir, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`,
      [ref_initial, ref_propre, courrier_id, user_id, type, status, propr || null, description, transfere, String(serv_id), current_trans_id, String(id_dg), current_trans_id_dir]
    );

    await db.query(`UPDATE courriers SET transfere = 'oui', updated_at = NOW() WHERE c_id = $1`, [courrier_id]);

    return res.json({ message: 'Courrier bien transfere' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/transDocMove/:m_id
 */
async function makeMovementMove(req, res) {
  try {
    const {
      ref_initial, ref_propre, courrier_id, user_id, type, status,
      propr, description, transfere, serv_id, current_trans_id, id_dg, current_trans_id_dir,
    } = req.body;

    await db.query(
      `INSERT INTO mouvements
        (ref_initial, ref_propre, courrier_id, user_id, type, status, propr, description, transfere, serv_id, current_trans_id, id_dg, current_trans_id_dir, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`,
      [ref_initial, ref_propre, courrier_id, user_id, type, status, propr || null, description, transfere, String(serv_id), current_trans_id, String(id_dg), current_trans_id_dir]
    );

    await db.query(`UPDATE mouvements SET transfere = 'oui', updated_at = NOW() WHERE m_id = $1`, [req.params.m_id]);

    return res.json({ message: 'Courrier bien transfere' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/getDocsHistory/:doc_id
 */
async function getMovements(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at,
              s.nom_serv, d.nom_dir, u.name AS user_name
       FROM mouvements m
       LEFT JOIN servs s ON s.s_id::text = m.serv_id
       LEFT JOIN dirs d ON d.d_id::text = m.id_dg
       JOIN users u ON u.id = m.user_id
       WHERE m.courrier_id = $1
       ORDER BY m.created_at`,
      [req.params.doc_id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/moveByDirection
 */
async function getListTransDocByDirection(req, res) {
  try {
    const id_dir = req.user.id_dir;
    let perPage = 10;
    if (req.query.lines) {
      perPage = req.query.lines === 'all' ? 999999 : parseInt(req.query.lines, 10) || 10;
    }
    const page = parseInt(req.query.page || '1', 10);
    const offset = (page - 1) * perPage;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM mouvements m WHERE m.current_trans_id_dir = $1`,
      [id_dir]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at, m.status AS mouvements_status,
              c.*, u.name AS user_name
       FROM mouvements m
       JOIN courriers c ON c.c_id = m.courrier_id
       JOIN users u ON u.id = m.user_id
       WHERE m.current_trans_id_dir = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id_dir, perPage, offset]
    );

    return res.json(paginate(rows, page, perPage, total));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/moveByService
 */
async function getListTransDocByService(req, res) {
  try {
    const id_serv = String(req.user.id_serv);
    let perPage = 10;
    if (req.query.lines) {
      perPage = req.query.lines === 'all' ? 999999 : parseInt(req.query.lines, 10) || 10;
    }
    const page = parseInt(req.query.page || '1', 10);
    const offset = (page - 1) * perPage;

    const countRes = await db.query(
      `SELECT COUNT(*) FROM mouvements WHERE serv_id = $1`,
      [id_serv]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at, m.status AS mouvements_status,
              m.ref_initial, m.ref_propre, m.serv_id, m.propr, m.transfere,
              s.nom_serv, c.*, u.name AS user_name
       FROM mouvements m
       JOIN servs s ON s.s_id::text = m.serv_id
       JOIN courriers c ON c.c_id = m.courrier_id
       JOIN users u ON u.id = m.user_id
       WHERE m.serv_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id_serv, perPage, offset]
    );

    return res.json(paginate(rows, page, perPage, total));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/moveTransferedByService
 */
async function getListTransferedDocByService(req, res) {
  try {
    const id_serv = String(req.user.id_serv);
    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at,
              s.nom_serv, d.nom_dir, c.*, u.name AS user_name
       FROM mouvements m
       LEFT JOIN servs s ON s.s_id::text = m.serv_id
       LEFT JOIN dirs d ON d.d_id::text = m.id_dg
       JOIN courriers c ON c.c_id = m.courrier_id
       JOIN users u ON u.id = m.user_id
       WHERE m.serv_id = $1 AND m.transfere = 'oui'
       ORDER BY m.created_at DESC`,
      [id_serv]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/moveTransferedToService
 */
async function getListTransferedDocToService(req, res) {
  try {
    const id_serv = String(req.user.id_serv);
    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at,
              s.nom_serv, d.nom_dir, c.*, u.name AS user_name
       FROM mouvements m
       LEFT JOIN servs s ON s.s_id::text = m.serv_id
       LEFT JOIN dirs d ON d.d_id::text = m.id_dg
       JOIN courriers c ON c.c_id = m.courrier_id
       JOIN users u ON u.id = m.user_id
       WHERE m.current_trans_id = $1 AND m.transfere = 'oui'
       ORDER BY m.created_at DESC`,
      [req.user.id_serv]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/serviceToSp
 */
async function moveServiceToSp(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at,
              s.nom_serv, c.*, u.name AS user_name
       FROM mouvements m
       LEFT JOIN servs s ON s.s_id::text = m.serv_id
       JOIN courriers c ON c.c_id = m.courrier_id
       JOIN users u ON u.id = m.user_id
       WHERE m.type = 'transfert' AND m.transfere = 'non'
       ORDER BY m.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/docUpdateLivreMove/:id_doc
 */
async function updateLivre(req, res) {
  try {
    const id = req.params.id_doc;
    const { rows } = await db.query('SELECT status FROM mouvements WHERE m_id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ message: 'Mouvement introuvable' });

    const newStatus = rows[0].status === 'non reçu' ? 'reçu' : 'non reçu';
    await db.query('UPDATE mouvements SET status = $1, updated_at = NOW() WHERE m_id = $2', [newStatus, id]);
    return res.json({ message: 'Courrier bien reçu' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/docByService/:id_doc
 */
async function fetchDocByOneByService(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at,
              s.nom_serv, c.*, u.name AS user_name
       FROM mouvements m
       JOIN servs s ON s.s_id::text = m.serv_id
       JOIN courriers c ON c.c_id = m.courrier_id
       JOIN users u ON u.id = m.user_id
       WHERE m.m_id = $1`,
      [req.params.id_doc]
    );
    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/docByServiceToSp/:id_doc
 */
async function fetchDocByOneByServiceToSp(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT m.*, m.created_at AS mouvements_created_at,
              s.nom_serv, c.*, u.name AS user_name
       FROM mouvements m
       LEFT JOIN servs s ON s.s_id::text = m.serv_id
       JOIN courriers c ON c.c_id = m.courrier_id
       JOIN users u ON u.id = m.user_id
       WHERE m.m_id = $1`,
      [req.params.id_doc]
    );
    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  makeMovement,
  makeMovementMove,
  getMovements,
  getListTransDocByDirection,
  getListTransDocByService,
  getListTransferedDocByService,
  getListTransferedDocToService,
  moveServiceToSp,
  updateLivre,
  fetchDocByOneByService,
  fetchDocByOneByServiceToSp,
};
