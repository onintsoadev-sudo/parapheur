const db = require('../config/db');

/** Helper pagination Laravel-like */
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
 * POST /api/doc
 */
async function addDoc(req, res) {
  try {
    const {
      provenance, chrono, ref, dir_id, motif, caracteristique,
      proprietaire, user_id, status, transfere, cin, tel,
    } = req.body;

    const required = { provenance, chrono, ref, dir_id, motif, caracteristique, proprietaire, user_id, status, transfere, cin, tel };
    for (const [k, v] of Object.entries(required)) {
      if (v === undefined || v === null || v === '') {
        return res.status(422).json({ message: `Le champ ${k} est requis` });
      }
    }

    const chronoExists = await db.query('SELECT c_id FROM courriers WHERE chrono = $1', [chrono]);
    if (chronoExists.rows.length) {
      return res.status(422).json({ message: 'Le chrono existe deja' });
    }
    const dirExists = await db.query('SELECT d_id FROM dirs WHERE d_id = $1', [dir_id]);
    if (!dirExists.rows.length) {
      return res.status(422).json({ message: "Cette Direction n'existe pas" });
    }

    await db.query(
      `INSERT INTO courriers
        (provenance, chrono, ref, dir_id, motif, caracteristique, proprietaire, user_id, status, transfere, cin, tel, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
      [provenance, chrono, ref, dir_id, motif, caracteristique, proprietaire, user_id, status, transfere, cin, tel]
    );

    return res.json({ message: 'Courrier creer avec succes' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/docs
 */
async function fetchDocs(req, res) {
  try {
    let perPage = 10;
    if (req.query.lines) {
      perPage = req.query.lines === 'all' ? 999999 : parseInt(req.query.lines, 10) || 10;
    }
    const page = parseInt(req.query.page || '1', 10);
    const offset = (page - 1) * perPage;

    const countRes = await db.query('SELECT COUNT(*) FROM courriers');
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT c.*, c.created_at AS courriers_created_at, c.status AS courriers_status,
              d.*
       FROM courriers c
       JOIN dirs d ON d.d_id = c.dir_id
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );

    return res.json(paginate(rows, page, perPage, total));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/docsByDirection
 */
async function fetchDocsByDirection(req, res) {
  try {
    const id_dir = req.user.id_dir;
    let perPage = 10;
    if (req.query.lines) {
      perPage = req.query.lines === 'all' ? 999999 : parseInt(req.query.lines, 10) || 10;
    }
    const page = parseInt(req.query.page || '1', 10);
    const offset = (page - 1) * perPage;

    const countRes = await db.query('SELECT COUNT(*) FROM courriers WHERE dir_id = $1', [id_dir]);
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT c.*, c.created_at AS courriers_created_at, c.status AS courriers_status, c.transfere AS courriers_transfere,
              d.*, u.name AS user_name
       FROM courriers c
       JOIN dirs d ON d.d_id = c.dir_id
       JOIN users u ON u.id = c.user_id
       WHERE c.dir_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id_dir, perPage, offset]
    );

    return res.json(paginate(rows, page, perPage, total));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/docByDirection/:id_doc
 */
async function fetchDocByOneByDirection(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT c.*, c.created_at AS courriers_created_at, c.status AS courriers_status,
              d.*, u.name AS user_name
       FROM courriers c
       JOIN dirs d ON d.d_id = c.dir_id
       JOIN users u ON u.id = c.user_id
       WHERE c.c_id = $1`,
      [req.params.id_doc]
    );
    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/delDoc/:id_courrier
 */
async function deleteDoc(req, res) {
  try {
    await db.query('DELETE FROM courriers WHERE c_id = $1', [req.params.id_courrier]);
    return res.json({ message: 'Courrier supprime avec succes' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/upDoc/:id_courrier
 */
async function updateDoc(req, res) {
  try {
    const id = req.params.id_courrier;
    const {
      provenance, chrono, ref, dir_id, motif, caracteristique,
      proprietaire, status, transfere, cin, tel,
    } = req.body;

    await db.query(
      `UPDATE courriers SET
        provenance = COALESCE($1, provenance),
        chrono = COALESCE($2, chrono),
        ref = COALESCE($3, ref),
        dir_id = COALESCE($4, dir_id),
        motif = COALESCE($5, motif),
        caracteristique = COALESCE($6, caracteristique),
        proprietaire = COALESCE($7, proprietaire),
        status = COALESCE($8, status),
        transfere = COALESCE($9, transfere),
        cin = COALESCE($10, cin),
        tel = COALESCE($11, tel),
        updated_at = NOW()
       WHERE c_id = $12`,
      [provenance, chrono, ref, dir_id, motif, caracteristique, proprietaire, status, transfere, cin, tel, id]
    );
    return res.json({ message: 'Courrier mis a jour avec succes' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/getDoc/:id_doc
 */
async function getDoc(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM courriers WHERE c_id = $1', [req.params.id_doc]);
    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/docUpdateLivre/:id_doc
 */
async function updateLivre(req, res) {
  try {
    const id_doc = req.params.id_doc;
    const { rows } = await db.query('SELECT status FROM courriers WHERE c_id = $1', [id_doc]);
    if (!rows[0]) return res.status(404).json({ message: 'Courrier introuvable' });

    const newStatus = rows[0].status === 'non reçu' ? 'reçu' : 'non reçu';
    await db.query('UPDATE courriers SET status = $1, updated_at = NOW() WHERE c_id = $2', [newStatus, id_doc]);
    return res.json({ message: 'Courrier bien reçu' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/findDoc
 */
async function findMyDoc(req, res) {
  try {
    const { ref } = req.body;
    const { rows } = await db.query(
      `SELECT c.*, c.created_at AS courriers_created_at, c.status AS courriers_status, d.*
       FROM courriers c
       JOIN dirs d ON d.d_id = c.dir_id
       WHERE c.ref = $1`,
      [ref]
    );
    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// ===================== STATISTIQUES =====================

async function courrierCount(req, res) {
  try {
    const { rows } = await db.query('SELECT created_at FROM courriers');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function courrierGotByOwnerCount(req, res) {
  try {
    const { start, end } = req.body || {};
    let result;
    if (start && end) {
      result = await db.query(
        `SELECT COUNT(*) FROM mouvements WHERE type = 'recuperation'
         AND created_at::date >= $1::date AND created_at::date <= $2::date`,
        [start, end]
      );
    } else {
      result = await db.query(`SELECT COUNT(*) FROM mouvements WHERE type = 'recuperation'`);
    }
    return res.json(parseInt(result.rows[0].count, 10));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function courrierNotGotByOwnerCount(req, res) {
  try {
    const { start, end } = req.body || {};
    let result;
    if (start && end) {
      result = await db.query(
        `SELECT COUNT(*) FROM mouvements WHERE type = 'transfert'
         AND created_at::date >= $1::date AND created_at::date <= $2::date`,
        [start, end]
      );
    } else {
      result = await db.query(`SELECT COUNT(*) FROM mouvements WHERE type = 'transfert'`);
    }
    return res.json(parseInt(result.rows[0].count, 10));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function listDate(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT DISTINCT created_at::date AS date FROM courriers ORDER BY date DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function courrierNotLivred(req, res) {
  try {
    const { rows } = await db.query(`SELECT COUNT(*) FROM courriers WHERE status = 'non reçu'`);
    return res.json(parseInt(rows[0].count, 10));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function courrierNotLivredByPeriod(req, res) {
  try {
    const { start, end } = req.body || {};
    if (start && end) {
      const { rows } = await db.query(
        `SELECT COUNT(*) FROM courriers WHERE status = 'non reçu'
         AND created_at::date >= $1::date AND created_at::date <= $2::date`,
        [start, end]
      );
      return res.json(parseInt(rows[0].count, 10));
    }
    return courrierNotLivred(req, res);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function courrierLivred(req, res) {
  try {
    const { rows } = await db.query(`SELECT COUNT(*) FROM courriers WHERE status = 'reçu'`);
    return res.json(parseInt(rows[0].count, 10));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function courrierLivredByPeriod(req, res) {
  try {
    const { start, end } = req.body || {};
    if (start && end) {
      const { rows } = await db.query(
        `SELECT COUNT(*) FROM courriers WHERE status = 'reçu'
         AND created_at::date >= $1::date AND created_at::date <= $2::date`,
        [start, end]
      );
      return res.json(parseInt(rows[0].count, 10));
    }
    return courrierLivred(req, res);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function graph(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT created_at::date AS date, COUNT(*) AS total
       FROM courriers GROUP BY created_at::date ORDER BY date`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function numberOfDocByService(req, res) {
  try {
    const { start, end, id_dir } = req.body || {};
    const dirId = id_dir || req.user?.id_dir;
    let query = `
      SELECT s.nom_serv, COUNT(c.c_id) AS total
      FROM servs s
      LEFT JOIN users u ON u.id_serv = s.s_id
      LEFT JOIN courriers c ON c.user_id = u.id
    `;
    const params = [];
    const conditions = [];
    if (dirId) {
      params.push(dirId);
      conditions.push(`s.dir_id = $${params.length}`);
    }
    if (start && end) {
      params.push(start, end);
      conditions.push(`c.created_at::date >= $${params.length - 1}::date AND c.created_at::date <= $${params.length}::date`);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY s.s_id, s.nom_serv ORDER BY s.nom_serv';

    const { rows } = await db.query(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function numberOfDocByServiceNoFilter(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT s.nom_serv, COUNT(c.c_id) AS total
       FROM servs s
       LEFT JOIN users u ON u.id_serv = s.s_id
       LEFT JOIN courriers c ON c.user_id = u.id
       GROUP BY s.s_id, s.nom_serv ORDER BY s.nom_serv`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function numberOfDocByDirectionAdmin(req, res) {
  try {
    const { start, end } = req.body || {};
    const dirs = (await db.query('SELECT * FROM dirs')).rows;
    const data = [];

    for (const dir of dirs) {
      let listQuery = 'SELECT created_at FROM courriers WHERE dir_id = $1';
      const params = [dir.d_id];
      if (start && end) {
        listQuery += ' AND created_at::date >= $2::date AND created_at::date <= $3::date';
        params.push(start, end);
      }
      const listDoc = (await db.query(listQuery, params)).rows;

      let got = 0;
      const servs = (await db.query('SELECT s_id FROM servs WHERE dir_id = $1', [dir.d_id])).rows;
      for (const serv of servs) {
        let gotQuery = `SELECT COUNT(*) FROM mouvements WHERE serv_id = $1 AND type = 'recuperation'`;
        const gParams = [String(serv.s_id)];
        if (start && end) {
          gotQuery += ' AND created_at::date >= $2::date AND created_at::date <= $3::date';
          gParams.push(start, end);
        }
        const g = await db.query(gotQuery, gParams);
        got += parseInt(g.rows[0].count, 10);
      }
      const notGot = listDoc.length - got;
      data.push([dir.nom_dir, listDoc, got, notGot]);
    }
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function numberOfDocByDirection(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT d.nom_dir, COUNT(c.c_id) AS total
       FROM dirs d
       LEFT JOIN courriers c ON c.dir_id = d.d_id
       GROUP BY d.d_id, d.nom_dir ORDER BY d.nom_dir`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function numberOfDocByDirectionByPeriod(req, res) {
  try {
    const { start, end } = req.body || {};
    if (!start || !end) return numberOfDocByDirection(req, res);

    const { rows } = await db.query(
      `SELECT d.nom_dir, COUNT(c.c_id) AS total
       FROM dirs d
       LEFT JOIN courriers c ON c.dir_id = d.d_id
         AND c.created_at::date >= $1::date AND c.created_at::date <= $2::date
       GROUP BY d.d_id, d.nom_dir ORDER BY d.nom_dir`,
      [start, end]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function filterPeriodDate(req, res) {
  try {
    const { start, end } = req.body || {};
    if (!start || !end) {
      const { rows } = await db.query('SELECT * FROM courriers ORDER BY created_at DESC');
      return res.json(rows);
    }
    const { rows } = await db.query(
      `SELECT * FROM courriers
       WHERE created_at::date >= $1::date AND created_at::date <= $2::date
       ORDER BY created_at DESC`,
      [start, end]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function countDocByDirection(req, res) {
  try {
    const id_dir = req.user?.id_dir || req.body?.id_dir;
    const { rows } = await db.query(
      'SELECT COUNT(*) FROM courriers WHERE dir_id = $1',
      [id_dir]
    );
    return res.json(parseInt(rows[0].count, 10));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  addDoc,
  fetchDocs,
  fetchDocsByDirection,
  fetchDocByOneByDirection,
  deleteDoc,
  updateDoc,
  getDoc,
  updateLivre,
  findMyDoc,
  courrierCount,
  courrierGotByOwnerCount,
  courrierNotGotByOwnerCount,
  listDate,
  courrierNotLivred,
  courrierNotLivredByPeriod,
  courrierLivred,
  courrierLivredByPeriod,
  graph,
  numberOfDocByService,
  numberOfDocByServiceNoFilter,
  numberOfDocByDirectionAdmin,
  numberOfDocByDirection,
  numberOfDocByDirectionByPeriod,
  filterPeriodDate,
  countDocByDirection,
};
