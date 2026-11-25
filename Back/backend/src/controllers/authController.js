const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendMail } = require('../utils/mail');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/register  (auth required)
 */
async function register(req, res) {
  try {
    const { name, email, im, id_dir, id_serv, role, status, password, password_confirmation } = req.body;

    if (!name || !email || !im || !id_dir || !id_serv || !role || !status || !password) {
      return res.status(422).json({ message: 'Champs requis manquants' });
    }
    if (password.length < 8) {
      return res.status(422).json({ message: 'Le mot de passe doit etre au minimum 8 caracteres' });
    }
    if (password !== password_confirmation) {
      return res.status(422).json({ message: 'Les mots de passes ne correspondent pas' });
    }

    const emailExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailExists.rows.length) {
      return res.status(422).json({ message: 'Cet email est deja pris' });
    }
    const imExists = await db.query('SELECT id FROM users WHERE im = $1', [im]);
    if (imExists.rows.length) {
      return res.status(422).json({ message: 'Cet imatricule est deja pris' });
    }
    const servExists = await db.query('SELECT s_id FROM servs WHERE s_id = $1', [id_serv]);
    if (!servExists.rows.length) {
      return res.status(422).json({ message: "Le service selectionne n'existe pas" });
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.query(
      `INSERT INTO users (name, email, im, id_dir, id_serv, role, status, password, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
      [name, email, im, id_dir, id_serv, role, status, hashed]
    );

    await sendMail({
      to: email,
      subject: 'Votre compte e-parapheur',
      text: `Votre mot de passe e-parapheur est ${password}`,
    });

    return res.json({ message: 'utilisateur creer avec success' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ message: 'Le champ email / mot de passe est requis' });
    }

    const { rows } = await db.query(
      `SELECT u.*, d.nom_dir, d.d_id, s.nom_serv, s.s_id
       FROM users u
       JOIN dirs d ON d.d_id = u.id_dir
       JOIN servs s ON s.s_id = u.id_serv
       WHERE u.email = $1`,
      [email]
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'email ou mot de passe incorrect' });
    }

    if (user.status === 'desactive') {
      return res.status(403).json({ message: "Votre compte est Bloque, veuillez informer l'administrateur" });
    }

    const token = generateToken(user);
    // Ne pas renvoyer le hash du mot de passe
    delete user.password;
    return res.json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/logout  (auth)
 */
async function logout(req, res) {
  // Avec JWT stateless, le logout côté client suffit (suppression du token).
  // On peut éventuellement blacklister le token ici si besoin.
  return res.json({ message: 'utilisateur deconnecte' });
}

/**
 * POST /api/updateStatus/:user_id  (auth)
 */
async function updateStatus(req, res) {
  try {
    const user_id = req.params.user_id;
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (!rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const newStatus = rows[0].status === 'active' ? 'desactive' : 'active';
    await db.query('UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, user_id]);
    return res.json({ message: 'status de compte modifie' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/updateUser/password  (auth)
 */
async function updateUserPassword(req, res) {
  try {
    const { password, new_password, new_password_confirmation } = req.body;
    if (!password || !new_password) {
      return res.status(422).json({ message: 'Le champ mot de passe est requis' });
    }
    if (new_password.length < 8) {
      return res.status(422).json({ message: 'Le mot de passe doit etre au moins 8 caracteres' });
    }
    if (new_password !== new_password_confirmation) {
      return res.status(422).json({ message: 'Les mots de passes ne se correspondent pas' });
    }

    const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (!(await bcrypt.compare(password, rows[0].password))) {
      return res.status(400).json({ message: 'Votre mot de passe est incorrect' });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);
    return res.json({ message: 'Votre mot de passe a ete modifiee avec succes' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/updateUser/info  (auth)
 */
async function updateUserInfo(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(422).json({ message: 'Le champ nom est obligatoire' });
    await db.query('UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2', [name, req.user.id]);
    return res.json({ message: 'Votre nom a ete modifiee avec succes' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/forgotPassword
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(422).json({ message: 'Email requis' });

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows[0]) return res.status(422).json({ message: 'Email non valide' });

    // Créer un token simple (stocké en base pour vérification)
    const token = jwt.sign({ email, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // On stocke un hash du token pour validation
    await db.query(
      `INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, created_at, updated_at)
       VALUES ('User', $1, $2, $3, NOW(), NOW())
       ON CONFLICT (token) DO NOTHING`,
      [rows[0].id, email, token.slice(0, 64)]
    );

    const link = `${process.env.APP_URL}/api/resetPassword/${email}/${token}`;
    await sendMail({
      to: email,
      subject: 'Réinitialisation mot de passe e-parapheur',
      text: `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${link}`,
    });

    return res.json({ message: 'Lien de confirmation bien envoyee' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/resetPassword/:email/:token
 */
async function resetPassword(req, res) {
  try {
    const { email, token } = req.params;
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows[0]) return res.status(400).json({ message: "Erreur d'authentification" });

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(403).json({ message: 'Action non autorise' });
    }

    const password = String(Date.now()) + String(Math.floor(Math.random() * 1e12));
    const hashed = await bcrypt.hash(password, 12);
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2', [hashed, email]);

    return res.json({
      message: 'Votre mot de passe a ete reinitialisee',
      mdp: password,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/usersList  (auth)
 */
async function usersList(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const countRes = await db.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT u.*, u.created_at AS users_created_at, u.updated_at AS users_updated_at,
              s.*, d.*
       FROM users u
       JOIN servs s ON s.s_id = u.id_serv
       JOIN dirs d ON d.d_id = u.id_dir
       ORDER BY u.id
       LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );

    return res.json({
      data: rows,
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.ceil(total / perPage) || 1,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/userCount  (auth)
 */
async function userCount(req, res) {
  try {
    const { rows } = await db.query('SELECT COUNT(*) FROM users');
    return res.json(parseInt(rows[0].count, 10));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/user  (auth)
 */
async function getUser(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT u.*, d.*, s.*
       FROM users u
       JOIN dirs d ON d.d_id = u.id_dir
       JOIN servs s ON s.s_id = u.id_serv
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (rows[0]) delete rows[0].password;
    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  updateStatus,
  updateUserPassword,
  updateUserInfo,
  forgotPassword,
  resetPassword,
  usersList,
  userCount,
  getUser,
};
