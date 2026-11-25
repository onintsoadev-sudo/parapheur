const db = require('../config/db');

/**
 * GET /api/visitors
 */
async function increment(req, res) {
  try {
    // format yy-mm-dd comme dans le Laravel original
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const date = `${yy}-${mm}-${dd}`;

    const { rows } = await db.query('SELECT * FROM visitors WHERE date = $1', [date]);
    if (rows[0]) {
      await db.query('UPDATE visitors SET nbr = nbr + 1, updated_at = NOW() WHERE date = $1', [date]);
    } else {
      await db.query(
        'INSERT INTO visitors (date, nbr, created_at, updated_at) VALUES ($1, 1, NOW(), NOW())',
        [date]
      );
    }

    const all = await db.query('SELECT nbr FROM visitors');
    let counter = 0;
    for (const row of all.rows) {
      counter += row.nbr || 0;
    }
    return res.json(counter);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/visitors/period
 */
async function showNumberOfVisitByPeriod(req, res) {
  try {
    const { start, end } = req.body || {};
    let rows;
    if (start && end) {
      const result = await db.query(
        `SELECT nbr FROM visitors WHERE date::date >= $1::date AND date::date <= $2::date`,
        [start, end]
      );
      rows = result.rows;
    } else {
      const result = await db.query('SELECT nbr FROM visitors');
      rows = result.rows;
    }
    let counter = 0;
    for (const row of rows) counter += row.nbr || 0;
    return res.json(counter);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/visitors/charts
 */
async function getViewPeriodForChartLine(req, res) {
  try {
    const { rows } = await db.query('SELECT nbr FROM visitors ORDER BY v_id');
    return res.json(rows.map((r) => ({ nbr: r.nbr })));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { increment, showNumberOfVisitByPeriod, getViewPeriodForChartLine };
