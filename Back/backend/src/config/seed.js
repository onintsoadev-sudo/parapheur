/**
 * Seed de démarrage : structure minimale + compte admin
 *
 * Usage : npm run seed
 *
 * Identifiants créés :
 *   Email    : admin@parapheur.local
 *   Password : Admin123!
 *   Role     : admin
 */
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  try {
    console.log('--- Seed e-parapheur ---');

    // 1. Direction Générale
    let dg = await db.query(`SELECT * FROM dgs WHERE nom_dg = $1`, ['Direction Générale']);
    if (!dg.rows.length) {
      dg = await db.query(
        `INSERT INTO dgs (nom_dg, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *`,
        ['Direction Générale']
      );
      console.log('✓ DG créée');
    } else {
      console.log('• DG déjà présente');
    }
    const dgId = dg.rows[0].dg_id;

    // 2. Direction
    let dir = await db.query(`SELECT * FROM dirs WHERE nom_dir = $1`, ['Direction Administrative']);
    if (!dir.rows.length) {
      dir = await db.query(
        `INSERT INTO dirs (nom_dir, porte_dir, dg_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        ['Direction Administrative', 'Porte A1', dgId]
      );
      console.log('✓ Direction créée');
    } else {
      console.log('• Direction déjà présente');
    }
    const dirId = dir.rows[0].d_id;

    // 3. Service
    let serv = await db.query(`SELECT * FROM servs WHERE nom_serv = $1`, ['Service Courrier']);
    if (!serv.rows.length) {
      serv = await db.query(
        `INSERT INTO servs (nom_serv, porte_serv, dir_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        ['Service Courrier', 'Porte S1', dirId]
      );
      console.log('✓ Service créé');
    } else {
      console.log('• Service déjà présent');
    }
    const servId = serv.rows[0].s_id;

    // 4. Utilisateur admin
    const email = 'admin@parapheur.local';
    const passwordPlain = 'Admin123!';
    let user = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (!user.rows.length) {
      const hashed = await bcrypt.hash(passwordPlain, 12);
      user = await db.query(
        `INSERT INTO users
          (name, email, im, id_dir, id_serv, role, status, password, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, name, email, role`,
        ['Administrateur', email, 'IM-ADMIN-001', dirId, servId, 'admin', 'active', hashed]
      );
      console.log('✓ Utilisateur admin créé');
    } else {
      // Réinitialiser le mot de passe au cas où
      const hashed = await bcrypt.hash(passwordPlain, 12);
      await db.query(
        `UPDATE users SET password = $1, status = 'active', role = 'admin',
         id_dir = $2, id_serv = $3, updated_at = NOW() WHERE email = $4`,
        [hashed, dirId, servId, email]
      );
      console.log('• Utilisateur admin déjà présent → mot de passe réinitialisé');
    }

    // 5. Autres utilisateurs de test (optionnel)
    const otherUsers = [
      { name: 'Agent SP', email: 'sp@parapheur.local', im: 'IM-SP-001', role: 'sp' },
      { name: 'Agent SCC', email: 'scc@parapheur.local', im: 'IM-SCC-001', role: 'scc' },
      { name: 'Agent Service', email: 'agent@parapheur.local', im: 'IM-AGENT-001', role: 'agent' },
    ];

    for (const u of otherUsers) {
      const exists = await db.query(`SELECT id FROM users WHERE email = $1`, [u.email]);
      if (!exists.rows.length) {
        const hashed = await bcrypt.hash(passwordPlain, 12);
        await db.query(
          `INSERT INTO users
            (name, email, im, id_dir, id_serv, role, status, password, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, NOW(), NOW())`,
          [u.name, u.email, u.im, dirId, servId, u.role, hashed]
        );
        console.log(`✓ Utilisateur ${u.role} créé (${u.email})`);
      }
    }

    console.log('');
    console.log('========================================');
    console.log('  COMPTES DE CONNEXION');
    console.log('========================================');
    console.log('  Email    : admin@parapheur.local');
    console.log('  Password : Admin123!');
    console.log('  Role     : admin');
    console.log('');
    console.log('  Autres comptes (même mot de passe) :');
    console.log('  - sp@parapheur.local      (role: sp)');
    console.log('  - scc@parapheur.local     (role: scc)');
    console.log('  - agent@parapheur.local   (role: agent)');
    console.log('========================================');
    console.log('');
    console.log('Seed terminé avec succès.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur seed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
