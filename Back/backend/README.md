# e-parapheur Backend (Express.js)

Backend API converti depuis Laravel vers **Express.js**, sans modification du fonctionnement des endpoints.

Base de données : **PostgreSQL** (même schéma / même base que l'original Laravel).

---

## Prérequis

- **Node.js** >= 18
- **PostgreSQL** (base `parapheur` déjà créée, ou à créer)
- npm ou yarn

---

## Installation

### 1. Extraire le projet

```bash
unzip e-parapheur-express-backend.zip
cd e-parapheur-express-backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` :

```env
PORT=8000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=parapheur
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=une_cle_secrete_tres_longue_et_aleatoire
APP_URL=http://localhost:8000
```

> **Important** : utilisez les **mêmes identifiants PostgreSQL** que dans votre ancien backend Laravel pour conserver les données existantes.

### 4. Créer les tables (si base vide)

Si la base est **vide** (nouvelle installation) :

```bash
npm run migrate
```

Si vous réutilisez la base Laravel déjà migrée, **ne lancez pas** cette commande.

### 5. Créer un utilisateur admin (IMPORTANT)

Dans le projet Laravel d’origine, **aucun mot de passe admin n’était défini de façon fiable**.  
Lancez le seed pour créer des comptes de test :

```bash
npm run seed
```

**Comptes créés :**

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@parapheur.local` | `Admin123!` | admin |
| `sp@parapheur.local` | `Admin123!` | sp |
| `scc@parapheur.local` | `Admin123!` | scc |
| `agent@parapheur.local` | `Admin123!` | agent |

Utilisez ces identifiants sur la page de login du frontend.

### 6. Démarrer le serveur

```bash
# Production
npm start

# Développement (rechargement auto)
npm run dev
```

Le serveur écoute sur **http://localhost:8000**  
Les routes API sont sous **http://localhost:8000/api/...**

---

## Configuration du frontend

Dans le frontend, l’URL de base de l’API (axios) doit pointer vers le backend Express, par exemple :

```js
// axiosClient.js ou .env du front
baseURL: "http://127.0.0.1:8000/api"
// ou
baseURL: "http://localhost:8000/api"
```

Le login envoie `POST /login` avec `{ email, password }` — c’est exactement ce que le backend Express attend.

---

## Authentification

L'authentification utilise **JWT** (équivalent fonctionnel de Laravel Sanctum).

1. `POST /api/login` avec `{ "email": "...", "password": "..." }`
2. Récupérer le `token` dans la réponse
3. L'envoyer dans les requêtes protégées :

```
Authorization: Bearer <token>
```

Le frontend stocke déjà ce token dans `localStorage` sous la clé `ACCESS_TOKEN` — rien à changer de ce côté.

---

## Structure du projet

```
e-parapheur-express-backend/
├── package.json
├── .env.example
├── README.md
└── src/
    ├── index.js              # Point d'entrée
    ├── config/
    │   ├── db.js             # Connexion PostgreSQL
    │   └── migrate.js        # Création des tables (optionnel)
    ├── middleware/
    │   └── auth.js           # Middleware JWT
    ├── controllers/
    │   ├── authController.js
    │   ├── courrierController.js
    │   ├── mouvementController.js
    │   ├── dgController.js
    │   ├── dirController.js
    │   ├── servController.js
    │   ├── visitorController.js
    │   └── supportController.js
    ├── routes/
    │   └── index.js          # Toutes les routes /api
    └── utils/
        └── mail.js           # Envoi d'emails (nodemailer)
```

---

## Routes principales (identiques à Laravel)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /api/login | Non | Connexion |
| POST | /api/logout | Oui | Déconnexion |
| POST | /api/register | Oui | Créer un utilisateur |
| GET | /api/user | Oui | Utilisateur connecté |
| GET/POST/... | /api/dg, /api/dir, /api/serv | Selon | CRUD ressources |
| POST | /api/doc | Oui | Ajouter un courrier |
| GET | /api/docs | Oui | Liste des courriers |
| POST | /api/transDoc | Oui | Transférer un courrier |
| GET | /api/stats/* | Selon | Statistiques |
| GET | /api/visitors | Non | Incrémenter visiteurs |
| POST | /api/support | Non | Message support |

---

## Notes de migration Laravel → Express

| Laravel | Express |
|---------|---------|
| Sanctum (Bearer token) | JWT (jsonwebtoken) |
| Eloquent / Query Builder | `pg` (requêtes SQL paramétrées) |
| `Hash::make` / `bcrypt` | `bcryptjs` |
| Mail Laravel | nodemailer (optionnel) |
| `paginate()` | pagination manuelle compatible |

Les **chemins d'API** et les **corps de réponse** restent aussi proches que possible de l'original pour que le frontend continue de fonctionner sans changement majeur.

---

## Support

En cas de problème de connexion à la base, vérifiez :

1. Que PostgreSQL tourne
2. Que la base `parapheur` existe
3. Les identifiants dans `.env`
4. Que le port 8000 n'est pas déjà utilisé
